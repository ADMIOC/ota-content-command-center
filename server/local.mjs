import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSeedState } from "../src/socialEngineData.js";
import { deploymentStatus } from "./deploymentConfig.mjs";
import { persistenceStatus } from "./persistenceAdapter.mjs";
import { readSecret, secretStatus, writeSecret } from "./secretStore.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 5174);
const statePath = path.resolve(root, process.env.OTA_SOCIAL_STATE_PATH || "./data/social-engine-state.json");
const distRoot = path.join(root, "dist");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

async function readState() {
  try {
    return ensureGovernance(JSON.parse(await fs.readFile(statePath, "utf8")));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const seed = createSeedState();
    ensureGovernance(seed);
    await writeState(seed);
    return seed;
  }
}

async function writeState(state) {
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("request_too_large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
  });
}

function findProfile(state, profileId) {
  return state.profiles.find((profile) => profile.id === profileId);
}

function findProfileByCandidateId(state, candidateId) {
  return state.profiles.find((profile) => (profile.restreamCandidate?.id || `candidate-${profile.id}`) === candidateId);
}

function ensureGovernance(state) {
  const previousRules = state.governance?.approvalRules || [];
  state.governance = {
    activeRole: state.governance?.activeRole || "operator",
    activeActor: state.governance?.activeActor || "Local Operator",
    roles: {
      super_admin: {
        label: "Super Admin",
        permissions: ["edit_profile", "record_asset", "record_evidence", "store_secret", "approve_connector", "submit_connector", "view_all_brands"]
      },
      brand_owner: {
        label: "Brand Owner",
        permissions: ["edit_profile", "record_asset", "record_evidence", "approve_connector", "view_assigned_brand"]
      },
      operator: {
        label: "Operator",
        permissions: ["edit_profile", "record_asset", "record_evidence", "view_assigned_brand"]
      },
      asset_reviewer: {
        label: "Asset Reviewer",
        permissions: ["record_asset", "record_evidence", "view_assigned_brand"]
      },
      connector_approver: {
        label: "Connector Approver",
        permissions: ["record_evidence", "store_secret", "approve_connector", "submit_connector", "view_assigned_brand"]
      },
      read_only_reviewer: {
        label: "Read-Only Reviewer",
        permissions: ["view_assigned_brand"]
      }
    },
    brandPolicies: {
      otap: { boundary: "Own The Algo public media and social profile operations." },
      crshcs: { boundary: "Public-safe healthcare operations only. No PHI, no patient data, stricter approval required." },
      wyr: { boundary: "Local service brand profile and media readiness." },
      thevfo: { boundary: "Professional authority profile and media readiness." }
    },
    approvalRules: [
      ...previousRules.filter((rule) => !String(rule).startsWith("Profile ready requires ownership proof")),
      "Security verified requires MFA or recovery proof.",
      "Restream approval requires connector proof and secret refs.",
      "CRS work must remain public-safe and no-PHI."
    ]
  };
  state.governance.approvalRules = [...new Set(state.governance.approvalRules)];
  return state;
}

function activePermissions(state) {
  return new Set(state.governance?.roles?.[state.governance?.activeRole]?.permissions || []);
}

function requirePermission(state, permission) {
  if (activePermissions(state).has(permission)) return;
  const error = new Error("permission_denied");
  error.status = 403;
  error.permission = permission;
  throw error;
}

function addAudit(state, profile, action, detail, eventType = "Secret") {
  const brand = state.brands.find((item) => item.id === profile?.brandId);
  state.auditEvents = state.auditEvents || [];
  state.auditEvents.unshift({
    id: crypto.randomUUID(),
    profileId: profile?.id || "",
    brandId: profile?.brandId || "",
    brand: brand?.name || "",
    brandSlug: brand?.slug || "",
    platformKey: profile?.platformKey || "system",
    eventType,
    action,
    detail,
    actor: state.governance?.activeActor || "Local Operator",
    status: "recorded",
    sourceSystem: "local_server",
    createdAt: new Date().toISOString()
  });
}

function restreamRedirectUri(req) {
  return process.env.RESTREAM_REDIRECT_URI || `http://${req.headers.host || `localhost:${port}`}/api/restream/oauth/callback`;
}

function encodeOAuthState(candidateId) {
  return Buffer.from(JSON.stringify({ candidateId, createdAt: Date.now() })).toString("base64url");
}

function decodeOAuthState(value = "") {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!parsed.candidateId) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function exchangeRestreamCode({ code, redirectUri, clientId, clientSecret }) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://api.restream.io/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code
    })
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const error = new Error("restream_code_exchange_failed");
    error.status = response.status;
    error.restream = data;
    throw error;
  }
  if (!data.access_token || !data.refresh_token) {
    const error = new Error("restream_code_exchange_incomplete");
    error.status = 502;
    throw error;
  }
  return data;
}

function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sanitizeRestreamPayload(value) {
  if (Array.isArray(value)) return value.map((item) => sanitizeRestreamPayload(item));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (/token|secret|password|stream.*key|rtmp.*key/i.test(key)) return [key, "[redacted]"];
    return [key, sanitizeRestreamPayload(item)];
  }));
}

function normalizeRestreamChannels(payload) {
  const channels = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.channels)
        ? payload.channels
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
  return channels.map((channel) => sanitizeRestreamPayload(channel));
}

const expectedRestreamPlatformIds = {
  youtube: [5],
  instagram: [73],
  custom_rtmp: [29]
};

const otapProfileIntelligence = {
  displayName: "Own The Algo Podcast",
  websiteUrl: "https://podcast.ownthealgo.com",
  bio: "Own The Algo helps underrepresented entrepreneurs become AI-native and agentic. Practical AI, automation, founder/operator lessons, and live build notes for creators, builders, operators, and investors navigating the agentic economy.",
  profileImageAsset: "OTAP YouTube avatar candidate - Hero Closeup Bright",
  bannerAsset: "OTAP YouTube banner candidate - DataBurst Gabriel Centered"
};

function channelMatchesProfile(channel, profile) {
  const expectedIds = expectedRestreamPlatformIds[profile.platformKey] || [];
  if (expectedIds.length && expectedIds.includes(Number(channel.platformId || channel.platform_id))) return true;
  const text = `${channel.displayName || ""} ${channel.name || ""} ${channel.channelUrl || ""} ${channel.platformName || ""} ${channel.platform || ""}`.toLowerCase();
  if (profile.platformKey === "youtube") return text.includes("youtube") || text.includes("youtu.be");
  if (profile.platformKey === "linkedin") return text.includes("linkedin");
  if (profile.platformKey === "facebook_page") return text.includes("facebook");
  if (profile.platformKey === "tiktok") return text.includes("tiktok");
  return false;
}

function socialProfileUrl(platformKey, handle = "") {
  const clean = String(handle).replace(/^@/, "").trim();
  if (!clean) return "";
  const map = {
    instagram: `https://www.instagram.com/${clean}`,
    youtube: `https://www.youtube.com/@${clean}`,
    tiktok: `https://www.tiktok.com/@${clean}`,
    linkedin: `https://www.linkedin.com/company/${clean}`,
    facebook_page: `https://www.facebook.com/${clean}`
  };
  return map[platformKey] || "";
}

function ensureRecord(list, id, record) {
  if (!Array.isArray(list)) return [record];
  if (list.some((item) => item.id === id)) return list;
  return [...list, record];
}

function decodeHtmlEntity(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getMetaContent(html = "", names = []) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i")
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeHtmlEntity(match[1]);
    }
  }
  return "";
}

function inferAssetTypeFromUrl(url = "") {
  const lower = url.toLowerCase();
  if (/\.(mp4|mov|m4v|webm)(\?|$)/.test(lower)) return "video";
  if (/\.gif(\?|$)/.test(lower)) return "gif";
  return "avatar";
}

function normalizeAssetUrl(url = "") {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return String(url).split("?")[0];
  }
}

async function scanPlatformProfile(profile) {
  const profileUrl = profile.profileUrl || socialProfileUrl(profile.platformKey, profile.actualHandle || profile.targetHandle);
  if (!profileUrl) {
    const error = new Error("profile_url_required");
    error.status = 409;
    throw error;
  }
  const response = await fetch(profileUrl, {
    headers: {
      "Accept": "text/html,application/xhtml+xml",
      "User-Agent": "OTA-Social-Engine/0.7 profile-asset-reconciliation"
    }
  });
  const html = await response.text();
  const title = getMetaContent(html, ["og:title", "twitter:title"]) || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "";
  const description = getMetaContent(html, ["og:description", "twitter:description", "description"]);
  const imageUrl = getMetaContent(html, ["og:image", "twitter:image", "twitter:image:src"]);
  const videoUrl = getMetaContent(html, ["og:video", "og:video:url", "twitter:player:stream"]);
  return {
    ok: response.ok,
    status: response.status,
    profileUrl,
    title: decodeHtmlEntity(title.trim()),
    description: decodeHtmlEntity(description.trim()),
    assets: [
      imageUrl ? {
        assetType: inferAssetTypeFromUrl(imageUrl),
        assetName: `${profile.platformKey} observed profile image`,
        platformAssetUrl: imageUrl,
        usageContext: "Observed profile image from platform metadata",
        description: "Detected from platform page metadata during scan. Treat as evidence until a controlled source asset is approved."
      } : null,
      videoUrl ? {
        assetType: inferAssetTypeFromUrl(videoUrl),
        assetName: `${profile.platformKey} observed video asset`,
        platformAssetUrl: videoUrl,
        usageContext: "Observed video from platform metadata",
        description: "Detected from platform page metadata during scan. Treat as evidence until a controlled source asset is approved."
      } : null
    ].filter(Boolean)
  };
}

function applyAgenticProfileCompletion(state, profile) {
  const brand = state.brands.find((item) => item.id === profile.brandId);
  const handle = profile.actualHandle || "";
  if (!handle) return false;

  const now = new Date().toISOString();
  let changed = false;

  if (!profile.profileUrl) {
    profile.profileUrl = socialProfileUrl(profile.platformKey, handle);
    changed = Boolean(profile.profileUrl) || changed;
  }

  if (brand?.slug === "otap") {
    if (!profile.displayName || (profile.platformKey !== "youtube" && profile.displayName === "Agentic Jey")) {
      profile.displayName = otapProfileIntelligence.displayName;
      changed = true;
    }
    if (!profile.bio) {
      profile.bio = otapProfileIntelligence.bio;
      changed = true;
    }
    if (!profile.websiteUrl) {
      profile.websiteUrl = otapProfileIntelligence.websiteUrl;
      changed = true;
    }
    if (!profile.profileImageAsset) {
      profile.profileImageAsset = otapProfileIntelligence.profileImageAsset;
      changed = true;
    }
    if (!profile.bannerAsset && ["youtube", "facebook_page", "linkedin"].includes(profile.platformKey)) {
      profile.bannerAsset = otapProfileIntelligence.bannerAsset;
      changed = true;
    }
  }

  if (profile.businessAccountStatus === "unknown" && ["instagram", "facebook_page", "tiktok"].includes(profile.platformKey)) {
    profile.businessAccountStatus = "pending";
    changed = true;
  }

  if (profile.ownershipState === "human_action_required") {
    profile.ownershipState = "ownership_claimed";
    changed = true;
  }
  if (profile.profileState === "incomplete") {
    profile.profileState = "needs_review";
    changed = true;
  }
  if (!profile.nextAction || profile.nextAction === "Connect the Own The Algo Podcast YouTube destination inside Restream, then re-run Validate Channels.") {
    profile.nextAction = `Review and approve the agent-completed ${profile.platformKey} profile fields, add account access/security proof, then mark the profile ready.`;
    changed = true;
  }
  profile.notes = [
    profile.notes,
    `Agentic profile completion ran after actual handle ${handle} was confirmed.`
  ].filter(Boolean).join("\n");
  profile.syncStatus = "needs_sync";
  profile.updatedAt = now;

  profile.evidence = ensureRecord(profile.evidence || [], `evidence-${profile.id}-actual-handle`, {
    id: `evidence-${profile.id}-actual-handle`,
    evidenceType: "ownership",
    title: "Actual handle confirmed",
    description: `Operator entered ${handle} as the actual ${profile.platformKey} handle. This confirms the basic account shell exists and triggered agent-assisted profile completion.`,
    status: "pending",
    createdAt: now
  });

  addAudit(state, profile, "Agentic profile completion applied", `Actual handle ${handle} triggered sourced profile completion for ${profile.platformKey}.`, "Profile");
  return changed;
}

async function refreshRestreamTokenForProfile({ state, profile, actor = "Restream Channel Validator" }) {
  const brand = state.brands.find((item) => item.id === profile.brandId);
  const candidate = profile.restreamCandidate || {};
  if (!candidate.restreamClientIdSecretRef || !candidate.restreamClientSecretRef || !candidate.restreamRefreshTokenSecretRef) {
    const error = new Error("restream_oauth_secret_refs_missing");
    error.status = 409;
    throw error;
  }
  const clientId = await readSecret({ root, secretRef: candidate.restreamClientIdSecretRef });
  const clientSecret = await readSecret({ root, secretRef: candidate.restreamClientSecretRef });
  const refreshToken = await readSecret({ root, secretRef: candidate.restreamRefreshTokenSecretRef });
  const response = await fetch("https://api.restream.io/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok || !data.access_token || !data.refresh_token) {
    const error = new Error("restream_oauth_refresh_failed");
    error.status = response.status || 502;
    throw error;
  }
  const accessSecret = await writeSecret({
    root,
    brandSlug: brand?.slug || profile.brandId,
    platformKey: profile.platformKey,
    credentialType: "restreamAccessToken",
    value: data.access_token,
    actor
  });
  const refreshSecret = await writeSecret({
    root,
    brandSlug: brand?.slug || profile.brandId,
    platformKey: profile.platformKey,
    credentialType: "restreamRefreshToken",
    value: data.refresh_token,
    actor
  });
  profile.restreamCandidate = {
    ...candidate,
    restreamAccessTokenSecretRef: accessSecret.secretRef,
    restreamRefreshTokenSecretRef: refreshSecret.secretRef,
    restreamTokenRefreshedAt: new Date().toISOString()
  };
  return data.access_token;
}

async function fetchRestreamChannels(accessToken) {
  const apiBase = process.env.RESTREAM_API_BASE || "https://api.restream.io/v2";
  const response = await fetch(`${apiBase}/user/channels`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const error = new Error("restream_channels_fetch_failed");
    error.status = response.status;
    error.restream = sanitizeRestreamPayload(data);
    throw error;
  }
  return data;
}

async function serveStatic(req, res, pathname) {
  let filePath = pathname === "/" ? "/app.html" : pathname;
  filePath = decodeURIComponent(filePath);
  const absolute = path.normalize(path.join(distRoot, filePath));
  if (!absolute.startsWith(distRoot)) return sendJson(res, 403, { error: "forbidden" });
  try {
    const bytes = await fs.readFile(absolute);
    const type = contentTypes[path.extname(absolute)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(bytes);
  } catch {
    const appHtml = await fs.readFile(path.join(distRoot, "app.html"));
    res.writeHead(200, { "Content-Type": contentTypes[".html"] });
    res.end(appHtml);
  }
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") {
    const deployment = await deploymentStatus({ root, isProduction: process.env.NODE_ENV === "production", serverMode: "local" });
    return sendJson(res, 200, {
      ok: true,
      service: "ota-social-engine",
      phase: 9,
      mode: "local",
      deploymentReady: deployment.readyForHostedProduction,
      secrets: secretStatus(root),
      restream: {
        enabled: Boolean(process.env.RESTREAM_ACCESS_TOKEN),
        supportsTokenSecretRef: true,
        supportsRefreshTokenFlow: true,
        apiBase: process.env.RESTREAM_API_BASE || "https://api.restream.io/v2",
        tokenEndpoint: "https://api.restream.io/oauth/token",
        requiredScope: "channels.write"
      }
    });
  }

  if (req.method === "GET" && pathname === "/api/deployment/status") {
    return sendJson(res, 200, await deploymentStatus({ root, isProduction: process.env.NODE_ENV === "production", serverMode: "local" }));
  }

  if (req.method === "GET" && pathname === "/api/state") {
    return sendJson(res, 200, await readState());
  }

  if (req.method === "POST" && pathname === "/api/state/reset") {
    const seed = createSeedState();
    ensureGovernance(seed);
    await writeState(seed);
    return sendJson(res, 200, seed);
  }

  if (req.method === "GET" && pathname === "/api/persistence/status") {
    return sendJson(res, 200, persistenceStatus(root));
  }

  if (req.method === "GET" && pathname === "/api/persistence/export") {
    const state = await readState();
    return sendJson(res, 200, {
      exportedAt: new Date().toISOString(),
      source: persistenceStatus(root),
      counts: {
        brands: state.brands?.length || 0,
        profiles: state.profiles?.length || 0,
        assets: (state.profiles || []).reduce((count, profile) => count + (profile.mediaAssets || []).length, 0),
        evidence: (state.profiles || []).reduce((count, profile) => count + (profile.evidence || []).length, 0),
        auditEvents: state.auditEvents?.length || 0
      },
      state
    });
  }

  if (req.method === "PATCH" && pathname === "/api/governance/active-role") {
    const state = await readState();
    const body = await readBody(req);
    if (!state.governance.roles[body.activeRole]) return sendJson(res, 400, { error: "unknown_role" });
    state.governance.activeRole = body.activeRole;
    state.governance.activeActor = body.activeActor || state.governance.roles[body.activeRole].label;
    state.auditEvents = state.auditEvents || [];
    state.auditEvents.unshift({
      id: crypto.randomUUID(),
      profileId: "",
      brandId: "",
      brand: "",
      brandSlug: "",
      platformKey: "system",
      eventType: "Governance",
      action: "Active role changed",
      detail: `Active role changed to ${state.governance.roles[body.activeRole].label}.`,
      actor: state.governance.activeActor,
      status: "recorded",
      sourceSystem: "local_server",
      createdAt: new Date().toISOString()
    });
    await writeState(state);
    return sendJson(res, 200, state);
  }

  const profilePatchMatch = pathname.match(/^\/api\/profiles\/([^/]+)$/);
  if (req.method === "PATCH" && profilePatchMatch) {
    const state = await readState();
    requirePermission(state, "edit_profile");
    const profile = findProfile(state, profilePatchMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const body = await readBody(req);
    const writableFields = [
      "targetHandle",
      "actualHandle",
      "profileUrl",
      "displayName",
      "bio",
      "websiteUrl",
      "businessAccountStatus",
      "profileImageAsset",
      "bannerAsset",
      "notes",
      "blockedReason",
      "nextAction"
    ];
    for (const field of writableFields) {
      if (field in body) profile[field] = body[field];
    }
    const completed = applyAgenticProfileCompletion(state, profile);
    addAudit(state, profile, "Profile fields saved", completed
      ? "Profile fields were saved and agentic completion filled missing brand-aligned fields after actual handle confirmation."
      : "Profile fields were saved through the local backend.");
    await writeState(state);
    return sendJson(res, 200, { profile, state });
  }

  const assetMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/assets$/);
  if (req.method === "POST" && assetMatch) {
    const state = await readState();
    requirePermission(state, "record_asset");
    const profile = findProfile(state, assetMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const body = await readBody(req);
    const now = new Date().toISOString();
    const asset = {
      id: body.id || `asset-${crypto.randomUUID()}`,
      assetType: body.assetType || "document",
      assetName: body.assetName || body.fileName || "Observed platform asset",
      fileName: body.fileName || "",
      mimeType: body.mimeType || "",
      width: body.width || "",
      height: body.height || "",
      fileSizeBytes: body.fileSizeBytes || "",
      publicUrl: body.publicUrl || body.platformAssetUrl || "",
      platformAssetUrl: body.platformAssetUrl || body.publicUrl || "",
      platformStatus: body.platformStatus || "observed_on_platform",
      sourceSystem: body.sourceSystem || "platform_observed",
      usageContext: body.usageContext || "Profile construct asset",
      description: body.description || "Asset observed on the live social platform account. Review before approving, replacing, or re-uploading.",
      approvalState: body.approvalState || "needs_review",
      createdAt: now,
      updatedAt: now
    };
    profile.mediaAssets = [...(profile.mediaAssets || []), asset];
    profile.syncStatus = "needs_sync";
    profile.updatedAt = now;
    addAudit(state, profile, "Media asset recorded", `${asset.assetName} was recorded as ${asset.platformStatus}.`, "Asset");
    await writeState(state);
    return sendJson(res, 201, { asset, state });
  }

  const evidenceMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/evidence$/);
  if (req.method === "POST" && evidenceMatch) {
    const state = await readState();
    requirePermission(state, "record_evidence");
    const profile = findProfile(state, evidenceMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const body = await readBody(req);
    const now = new Date().toISOString();
    const evidence = {
      id: body.id || `evidence-${crypto.randomUUID()}`,
      evidenceType: body.evidenceType || "profile",
      title: body.title || "Evidence record",
      description: body.description || "",
      evidenceUrl: body.evidenceUrl || "",
      status: body.status || "pending",
      createdAt: now,
      updatedAt: now
    };
    profile.evidence = [...(profile.evidence || []), evidence];
    profile.syncStatus = "needs_sync";
    profile.updatedAt = now;
    addAudit(state, profile, "Evidence recorded", `${evidence.title} was recorded.`, "Evidence");
    await writeState(state);
    return sendJson(res, 201, { evidence, state });
  }

  const platformScanMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/platform-scan$/);
  if (req.method === "POST" && platformScanMatch) {
    const state = await readState();
    requirePermission(state, "record_asset");
    const profile = findProfile(state, platformScanMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const now = new Date().toISOString();
    const scan = await scanPlatformProfile(profile);
    const existingUrls = new Set((profile.mediaAssets || []).map((asset) => normalizeAssetUrl(asset.platformAssetUrl || asset.publicUrl)).filter(Boolean));
    const recordedAssets = [];
    for (const found of scan.assets) {
      const normalizedUrl = normalizeAssetUrl(found.platformAssetUrl);
      if (existingUrls.has(normalizedUrl)) continue;
      const asset = {
        id: `asset-${crypto.randomUUID()}`,
        ...found,
        fileName: "",
        mimeType: "",
        width: "",
        height: "",
        fileSizeBytes: "",
        publicUrl: found.platformAssetUrl,
        platformStatus: "observed_on_platform",
        sourceSystem: "platform_scan",
        approvalState: "needs_review",
        observedAt: now,
        createdAt: now,
        updatedAt: now
      };
      profile.mediaAssets = [...(profile.mediaAssets || []), asset];
      existingUrls.add(normalizedUrl);
      recordedAssets.push(asset);
    }
    profile.evidence = ensureRecord(profile.evidence || [], `evidence-${profile.id}-platform-scan-${now.slice(0, 10)}`, {
      id: `evidence-${profile.id}-platform-scan-${now.slice(0, 10)}`,
      evidenceType: "profile",
      title: "Platform profile metadata scan",
      description: `Scanned ${scan.profileUrl}. Title: ${scan.title || "not available"}. Description: ${scan.description || "not available"}. Assets found: ${scan.assets.length}.`,
      evidenceUrl: scan.profileUrl,
      status: "pending",
      createdAt: now
    });
    profile.platformScan = {
      status: scan.ok ? "completed" : "completed_with_http_warning",
      httpStatus: scan.status,
      title: scan.title,
      description: scan.description,
      assetsFound: scan.assets.length,
      assetsRecorded: recordedAssets.length,
      scannedAt: now,
      sourceUrl: scan.profileUrl
    };
    profile.syncStatus = "needs_sync";
    profile.updatedAt = now;
    addAudit(state, profile, "Platform profile scanned", `${recordedAssets.length} new observed asset(s) were recorded from ${scan.profileUrl}.`, "Asset");
    await writeState(state);
    return sendJson(res, 200, { ok: true, scan: profile.platformScan, assets: recordedAssets, state });
  }

  const secretMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/secrets$/);
  if (req.method === "POST" && secretMatch) {
    const state = await readState();
    requirePermission(state, "store_secret");
    const profile = findProfile(state, secretMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const body = await readBody(req);
    const brand = state.brands.find((item) => item.id === profile.brandId);
    const secret = await writeSecret({
      root,
      brandSlug: brand?.slug || profile.brandId,
      platformKey: profile.platformKey,
      credentialType: body.credentialType,
      value: body.value,
      actor: body.actor || "Local Operator"
    });
    profile.restreamCandidate = {
      ...(profile.restreamCandidate || {}),
      id: profile.restreamCandidate?.id || `candidate-${profile.id}`,
      [secret.refField]: secret.secretRef,
      syncStatus: "needs_sync",
      sourceSystem: "local_secret_store",
      updatedAt: new Date().toISOString()
    };
    addAudit(state, profile, "Secret reference stored", `${body.credentialType} was stored in the local encrypted secret store. Only the secret reference was attached to the candidate.`);
    await writeState(state);
    return sendJson(res, 201, {
      secret,
      restreamCandidate: profile.restreamCandidate,
      state
    });
  }

  const approveRestreamMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/restream-candidate\/approve$/);
  if (req.method === "POST" && approveRestreamMatch) {
    const state = await readState();
    requirePermission(state, "approve_connector");
    const profile = findProfile(state, approveRestreamMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    profile.restreamCandidate = {
      ...(profile.restreamCandidate || {}),
      id: profile.restreamCandidate?.id || `candidate-${profile.id}`,
      approvalState: "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: state.governance.activeActor,
      readyForSubmit: false
    };
    profile.connectorState = "candidate";
    profile.syncStatus = "needs_sync";
    profile.updatedAt = new Date().toISOString();
    addAudit(state, profile, "Restream candidate approved", "Connector approval was recorded under Phase 8 governance.", "Approval");
    await writeState(state);
    return sendJson(res, 200, { restreamCandidate: profile.restreamCandidate, state });
  }

  const restreamPatchMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/restream-candidate$/);
  if (req.method === "PATCH" && restreamPatchMatch) {
    const state = await readState();
    if (!activePermissions(state).has("edit_profile") && !activePermissions(state).has("approve_connector")) {
      const error = new Error("permission_denied");
      error.status = 403;
      throw error;
    }
    const profile = findProfile(state, restreamPatchMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const body = await readBody(req);
    const rejected = Object.keys(body).filter((key) => /secret|token|password|stream.*key/i.test(key) && !/SecretRef$/.test(key));
    if (rejected.length) return sendJson(res, 400, { error: "plaintext_secret_fields_rejected", rejected });
    profile.restreamCandidate = {
      ...(profile.restreamCandidate || {}),
      id: profile.restreamCandidate?.id || `candidate-${profile.id}`,
      ...body,
      syncStatus: "needs_sync",
      sourceSystem: "frontend",
      updatedAt: new Date().toISOString()
    };
    profile.syncStatus = "needs_sync";
    profile.updatedAt = new Date().toISOString();
    addAudit(state, profile, "Restream candidate updated", "Restream candidate fields were updated under Phase 8 governance.", "Restream");
    await writeState(state);
    return sendJson(res, 200, { restreamCandidate: profile.restreamCandidate, state });
  }

  const oauthStartMatch = pathname.match(/^\/api\/restream\/candidates\/([^/]+)\/oauth\/authorize-url$/);
  if (req.method === "GET" && oauthStartMatch) {
    const state = await readState();
    requirePermission(state, "store_secret");
    const profile = findProfileByCandidateId(state, oauthStartMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const candidate = profile.restreamCandidate || {};
    if (!candidate.restreamClientIdSecretRef) return sendJson(res, 409, { error: "restream_client_id_missing" });
    const clientId = await readSecret({ root, secretRef: candidate.restreamClientIdSecretRef });
    const redirectUri = restreamRedirectUri(req);
    const authorizeUrl = new URL("https://api.restream.io/login");
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("state", encodeOAuthState(oauthStartMatch[1]));
    return sendJson(res, 200, {
      authorizeUrl: authorizeUrl.toString(),
      redirectUri,
      requiredScope: "channels.write"
    });
  }

  const channelListMatch = pathname.match(/^\/api\/restream\/candidates\/([^/]+)\/channels$/);
  if (req.method === "GET" && channelListMatch) {
    const state = await readState();
    requirePermission(state, "approve_connector");
    const profile = findProfileByCandidateId(state, channelListMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const candidate = profile.restreamCandidate || {};
    if (!candidate.restreamAccessTokenSecretRef) return sendJson(res, 409, { error: "restream_access_token_missing" });
    let accessToken = await readSecret({ root, secretRef: candidate.restreamAccessTokenSecretRef });
    let refreshed = false;
    let payload;
    try {
      payload = await fetchRestreamChannels(accessToken);
    } catch (error) {
      if (error.status !== 401) throw error;
      accessToken = await refreshRestreamTokenForProfile({ state, profile });
      refreshed = true;
      payload = await fetchRestreamChannels(accessToken);
    }
    const channels = normalizeRestreamChannels(payload);
    const matchingChannels = channels.filter((channel) => channelMatchesProfile(channel, profile));
    const validationStatus = matchingChannels.length ? "matched" : channels.length ? "mismatch" : "empty";
    profile.restreamCandidate = {
      ...(profile.restreamCandidate || {}),
      restreamConnectedChannels: channels,
      restreamMatchedChannels: matchingChannels,
      restreamChannelValidation: {
        status: validationStatus,
        channelCount: channels.length,
        matchingChannelCount: matchingChannels.length,
        refreshed,
        validatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };
    profile.connectorState = matchingChannels.length ? "candidate" : "none";
    profile.nextAction = matchingChannels.length
      ? profile.nextAction
      : "Connect the Own The Algo Podcast YouTube destination inside Restream, then re-run Validate Channels.";
    addAudit(state, profile, "Restream connected channels validated", `${channels.length} Restream channel record(s) were fetched through the OAuth token; ${matchingChannels.length} matched the ${profile.platformKey} profile.`, "Connector");
    await writeState(state);
    return sendJson(res, 200, {
      ok: true,
      refreshed,
      channels,
      validation: profile.restreamCandidate.restreamChannelValidation,
      state
    });
  }

  const dryRunMatch = pathname.match(/^\/api\/restream\/candidates\/([^/]+)\/dry-run$/);
  if (req.method === "POST" && dryRunMatch) {
    return sendJson(res, 200, {
      ok: false,
      note: "Local fallback server is running. Full Restream dry-run validation is available in server/index.mjs after Express dependency startup is restored."
    });
  }

  const oauthRefreshMatch = pathname.match(/^\/api\/restream\/candidates\/([^/]+)\/oauth\/refresh$/);
  if (req.method === "POST" && oauthRefreshMatch) {
    const state = await readState();
    requirePermission(state, "store_secret");
    const profile = findProfileByCandidateId(state, oauthRefreshMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    const accessToken = await refreshRestreamTokenForProfile({ state, profile, actor: state.governance.activeActor });
    profile.restreamCandidate = {
      ...(profile.restreamCandidate || {}),
      restreamTokenRefreshedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addAudit(state, profile, "Restream OAuth token refreshed", "Access and refresh tokens were rotated through the local OAuth refresh flow. Only secret references were stored.", "Restream OAuth");
    await writeState(state);
    return sendJson(res, 200, {
      refreshed: Boolean(accessToken),
      restreamCandidate: profile.restreamCandidate,
      state
    });
  }

  const submitMatch = pathname.match(/^\/api\/restream\/candidates\/([^/]+)\/submit$/);
  if (req.method === "POST" && submitMatch) {
    const state = await readState();
    requirePermission(state, "submit_connector");
    const profile = findProfileByCandidateId(state, submitMatch[1]);
    if (!profile) return sendJson(res, 404, { error: "profile_not_found" });
    return sendJson(res, 409, {
      error: "local_submit_requires_full_server",
      note: "The local fallback server enforces Phase 8 submit permission but does not perform external Restream writes. Use the full server adapter for live submission."
    });
  }

  return sendJson(res, 404, { error: "not_found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (req.method === "GET" && url.pathname === "/api/restream/oauth/callback") {
      const code = url.searchParams.get("code") || "";
      const stateValue = url.searchParams.get("state") || "";
      const decodedState = decodeOAuthState(stateValue);
      if (!code || !decodedState) {
        return sendHtml(res, 400, "<h1>Restream OAuth failed</h1><p>The authorization callback was missing a valid code or state.</p><p><a href=\"/app.html\">Return to OTA Social Engine</a></p>");
      }
      const state = await readState();
      const profile = findProfileByCandidateId(state, decodedState.candidateId);
      if (!profile) {
        return sendHtml(res, 404, "<h1>Restream OAuth failed</h1><p>The related social profile could not be found.</p><p><a href=\"/app.html\">Return to OTA Social Engine</a></p>");
      }
      const brand = state.brands.find((item) => item.id === profile.brandId);
      const candidate = profile.restreamCandidate || {};
      try {
        const clientId = await readSecret({ root, secretRef: candidate.restreamClientIdSecretRef });
        const clientSecret = await readSecret({ root, secretRef: candidate.restreamClientSecretRef });
        const tokenData = await exchangeRestreamCode({
          code,
          redirectUri: restreamRedirectUri(req),
          clientId,
          clientSecret
        });
        const accessSecret = await writeSecret({
          root,
          brandSlug: brand?.slug || profile.brandId,
          platformKey: profile.platformKey,
          credentialType: "restreamAccessToken",
          value: tokenData.access_token,
          actor: "Restream OAuth Callback"
        });
        const refreshSecret = await writeSecret({
          root,
          brandSlug: brand?.slug || profile.brandId,
          platformKey: profile.platformKey,
          credentialType: "restreamRefreshToken",
          value: tokenData.refresh_token,
          actor: "Restream OAuth Callback"
        });
        profile.restreamCandidate = {
          ...candidate,
          restreamAccessTokenSecretRef: accessSecret.secretRef,
          restreamRefreshTokenSecretRef: refreshSecret.secretRef,
          oauthScope: tokenData.scope || "",
          oauthTokenType: tokenData.token_type || "Bearer",
          oauthExpiresIn: tokenData.expires_in || "",
          syncStatus: "needs_sync",
          sourceSystem: "restream_oauth",
          updatedAt: new Date().toISOString()
        };
        addAudit(state, profile, "Restream OAuth grant stored", "Restream returned an access token and refresh token. Both were stored as local encrypted secret refs; no plaintext token was written to profile data.", "Connector");
        await writeState(state);
        return sendHtml(res, 200, "<h1>Restream OAuth connected</h1><p>The access token and refresh token were stored as secret references for this social profile.</p><p><a href=\"/app.html\">Return to OTA Social Engine</a></p>");
      } catch (error) {
        return sendHtml(res, error.status || 500, `<h1>Restream OAuth failed</h1><p>${error.message || "Token exchange failed"}.</p><p>Confirm the callback URL in Restream exactly matches this local callback URL.</p><p><a href="/app.html">Return to OTA Social Engine</a></p>`);
      }
    }
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url.pathname);
    return await serveStatic(req, res, url.pathname);
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message || "internal_error" });
  }
});

server.listen(port, () => {
  console.log(`OTA Social Engine local server running at http://localhost:${port}`);
});
