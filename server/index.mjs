import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { createSeedState } from "../src/socialEngineData.js";
import { deploymentStatus } from "./deploymentConfig.mjs";
import { mediaStorageConfig, storeUploadedMedia } from "./mediaStorage.mjs";
import { buildNotionSyncPlan, notionStatus } from "./notionAdapter.mjs";
import { persistenceStatus } from "./persistenceAdapter.mjs";
import {
  computeReadiness,
  sanitizeProfile,
  sanitizeRestreamCandidate,
  stripPlaintextSecrets,
  summarizeProfile
} from "./readiness.mjs";
import {
  buildSanitizedRestreamPayload,
  getRestreamIntegrationStatus,
  refreshRestreamOAuthTokens,
  submitRestreamChannel,
  validateRestreamCandidate
} from "./restreamAdapter.mjs";
import { secretStatus, writeSecret } from "./secretStore.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5174);
const statePath = path.resolve(root, process.env.OTA_SOCIAL_STATE_PATH || "./data/social-engine-state.json");
const mediaConfig = mediaStorageConfig(root);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

const app = express();
console.log("OTA Social Engine initializing Express middleware");
app.use(express.json({ limit: "20mb" }));
app.use(mediaConfig.publicBasePath, express.static(mediaConfig.mediaRoot));

app.get("/api/deployment/status", async (_req, res, next) => {
  try {
    res.json(await deploymentStatus({ root, isProduction, serverMode: "express" }));
  } catch (error) {
    next(error);
  }
});

app.get("/api/persistence/status", (_req, res) => {
  res.json(persistenceStatus(root));
});

app.get("/api/persistence/export", async (_req, res, next) => {
  try {
    const state = await readState();
    res.json({
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
  } catch (error) {
    next(error);
  }
});

async function ensureStateDir() {
  await fs.mkdir(path.dirname(statePath), { recursive: true });
}

async function readState() {
  await ensureStateDir();
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const seed = createSeedState();
    await writeState(seed);
    return seed;
  }
}

async function writeState(state) {
  await ensureStateDir();
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function findProfile(state, profileId) {
  return state.profiles.find((profile) => profile.id === profileId);
}

function findBrandBySlug(state, slug) {
  return state.brands.find((brand) => brand.slug === slug);
}

function candidateId(profile) {
  return profile.restreamCandidate?.id || `candidate-${profile.id}`;
}

function findCandidateProfile(state, id) {
  return state.profiles.find((profile) => candidateId(profile) === id || profile.restreamCandidate?.id === id);
}

function allAssets(state) {
  return state.profiles.flatMap((profile) => (profile.mediaAssets || []).map((asset) => ({
    ...asset,
    profileId: profile.id,
    brandId: profile.brandId,
    platformKey: profile.platformKey
  })));
}

function allEvidence(state) {
  return state.profiles.flatMap((profile) => (profile.evidence || []).map((evidence) => ({
    ...evidence,
    profileId: profile.id,
    brandId: profile.brandId,
    platformKey: profile.platformKey
  })));
}

function ensureCandidateId(profile) {
  profile.restreamCandidate = {
    id: candidateId(profile),
    ...(profile.restreamCandidate || {})
  };
  return profile.restreamCandidate;
}

function applyDerivedReadiness(profile) {
  const readiness = computeReadiness(profile);
  profile.readyForConnector = readiness.readyForConnector;
  profile.readyForPublishing = readiness.readyForPublishing;
  if (readiness.missingRequiredFields.length) {
    profile.profileState = profile.profileState === "ready" ? "needs_review" : profile.profileState;
  }
  return readiness;
}

function stateResponse(state) {
  return {
    ...state,
    profiles: state.profiles.map((profile) => sanitizeProfile(profile)),
    notion: notionStatus()
  };
}

function restreamCandidateResponse(profile) {
  return {
    ...sanitizeRestreamCandidate(ensureCandidateId(profile)),
    id: candidateId(profile),
    profileId: profile.id,
    brandId: profile.brandId,
    platformKey: profile.platformKey,
    readiness: computeReadiness(profile)
  };
}

function addAudit(state, profile, action, detail, eventType = "Profile Change") {
  const event = {
    id: crypto.randomUUID(),
    profileId: profile?.id || "",
    brandId: profile?.brandId || "",
    brand: state.brands.find((brand) => brand.id === profile?.brandId)?.name || "",
    brandSlug: state.brands.find((brand) => brand.id === profile?.brandId)?.slug || "",
    platformKey: profile?.platformKey || "system",
    eventType,
    action,
    detail,
    actor: "Local Operator",
    status: "recorded",
    sourceSystem: "backend_api",
    createdAt: new Date().toISOString()
  };
  state.auditEvents.unshift(event);
  return event;
}

async function storeCandidateSecret({ state, profile, credentialType, value, actor }) {
  const brand = state.brands.find((item) => item.id === profile.brandId);
  const secret = await writeSecret({
    root,
    brandSlug: brand?.slug || profile.brandId,
    platformKey: profile.platformKey,
    credentialType,
    value,
    actor
  });
  profile.restreamCandidate = {
    ...ensureCandidateId(profile),
    [secret.refField]: secret.secretRef,
    sourceSystem: "backend_secret_store",
    syncStatus: "needs_sync",
    updatedAt: new Date().toISOString()
  };
  applyDerivedReadiness(profile);
  addAudit(state, profile, "Secret reference stored", `${credentialType} was stored in the Phase 5 secret store. Only the secret reference was attached to the Phase 6 candidate.`, "Secret");
  return secret;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ota-social-engine",
    phase: 9,
    mode: isProduction ? "production" : "development",
    media: {
      storageMode: process.env.ASSET_STORAGE_MODE || "local-filesystem",
      publicBasePath: mediaConfig.publicBasePath
    },
    secrets: secretStatus(root),
    restream: getRestreamIntegrationStatus(),
    notion: notionStatus()
  });
});

app.get("/", (_req, res) => {
  res.redirect("/app.html");
});

app.get("/api/state", async (_req, res, next) => {
  try {
    res.json(stateResponse(await readState()));
  } catch (error) {
    next(error);
  }
});

app.post("/api/state/reset", async (_req, res, next) => {
  try {
    const seed = createSeedState();
    await writeState(seed);
    res.json(stateResponse(seed));
  } catch (error) {
    next(error);
  }
});

app.get("/api/brands", async (_req, res, next) => {
  try {
    const state = await readState();
    res.json({
      brands: state.brands.map((brand) => ({
        ...brand,
        profileCount: state.profiles.filter((profile) => profile.brandId === brand.id).length,
        readyCount: state.profiles.filter((profile) => profile.brandId === brand.id && computeReadiness(profile).readyForConnector).length
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/brands/:slug", async (req, res, next) => {
  try {
    const state = await readState();
    const brand = findBrandBySlug(state, req.params.slug);
    if (!brand) return res.status(404).json({ error: "brand_not_found" });
    res.json({
      brand,
      profiles: state.profiles.filter((profile) => profile.brandId === brand.id).map(summarizeProfile)
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/profiles/:profileId", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    res.json({ profile: sanitizeProfile(profile) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/profiles/:profileId", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const { sanitized, rejected } = stripPlaintextSecrets(req.body);
    if (rejected.length) return res.status(400).json({ error: "plaintext_secret_fields_rejected", rejected });
    Object.assign(profile, req.body, {
      ...sanitized,
      updatedAt: new Date().toISOString(),
      syncStatus: "needs_sync",
      sourceSystem: "frontend"
    });
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Profile fields updated", "Profile fields were updated through the Phase 6 backend API.");
    await writeState(state);
    res.json({ profile: sanitizeProfile(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/profiles/:profileId/assets", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const { sanitized, rejected } = stripPlaintextSecrets(req.body);
    if (rejected.length) return res.status(400).json({ error: "plaintext_secret_fields_rejected", rejected });
    const asset = {
      id: crypto.randomUUID(),
      ...sanitized,
      approvalState: sanitized.approvalState || "needs_review",
      sourceSystem: "frontend",
      syncStatus: "needs_sync",
      createdAt: new Date().toISOString()
    };
    profile.mediaAssets = [asset, ...(profile.mediaAssets || [])];
    if (asset.assetType === "avatar") profile.profileImageAsset = asset.assetName;
    if (asset.assetType === "banner") profile.bannerAsset = asset.assetName;
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Media asset added", `${asset.assetName || "Asset"} was added.`, "Media Asset");
    await writeState(state);
    res.status(201).json({ asset, profile: sanitizeProfile(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/profiles/:profileId/assets/upload", upload.single("file"), async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const { sanitized, rejected } = stripPlaintextSecrets(req.body);
    if (rejected.length) return res.status(400).json({ error: "plaintext_secret_fields_rejected", rejected });
    const assetType = sanitized.assetType || "document";
    const stored = await storeUploadedMedia({ root, state, profile, file: req.file, assetType });
    const asset = {
      id: crypto.randomUUID(),
      assetType,
      assetName: sanitized.assetName || stored.originalName,
      usageContext: sanitized.usageContext || "Profile construct media asset",
      description: sanitized.description || "Uploaded through Phase 4 media storage.",
      approvalState: sanitized.approvalState || "needs_review",
      sourceSystem: "frontend_upload",
      syncStatus: "needs_sync",
      createdAt: new Date().toISOString(),
      ...stored
    };
    profile.mediaAssets = [asset, ...(profile.mediaAssets || [])];
    if (asset.assetType === "avatar") profile.profileImageAsset = asset.assetName;
    if (asset.assetType === "banner") profile.bannerAsset = asset.assetName;
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Media file uploaded", `${asset.assetName || "Asset"} was uploaded and stored at ${asset.storagePath}.`, "Media Asset");
    await writeState(state);
    res.status(201).json({ asset, profile: sanitizeProfile(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/profiles/:profileId/evidence", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const { sanitized, rejected } = stripPlaintextSecrets(req.body);
    if (rejected.length) return res.status(400).json({ error: "plaintext_secret_fields_rejected", rejected });
    const evidence = {
      id: crypto.randomUUID(),
      ...sanitized,
      status: sanitized.status || "pending",
      sourceSystem: "frontend",
      syncStatus: "needs_sync",
      createdAt: new Date().toISOString()
    };
    profile.evidence = [evidence, ...(profile.evidence || [])];
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Evidence added", `${evidence.title || "Evidence"} was recorded.`, "Evidence");
    await writeState(state);
    res.status(201).json({ evidence, profile: sanitizeProfile(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/profiles/:profileId/restream-candidate", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const { sanitized, rejected } = stripPlaintextSecrets(req.body);
    if (rejected.length) return res.status(400).json({ error: "plaintext_secret_fields_rejected", rejected });
    profile.restreamCandidate = {
      ...ensureCandidateId(profile),
      ...sanitized,
      sourceSystem: "frontend",
      syncStatus: "needs_sync",
      updatedAt: new Date().toISOString()
    };
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Restream candidate updated", "Restream candidate fields were updated.", "Restream");
    await writeState(state);
    res.json({ restreamCandidate: restreamCandidateResponse(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/profiles/:profileId/secrets", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const { credentialType, value, actor } = req.body;
    const secret = await storeCandidateSecret({
      state,
      profile,
      credentialType,
      value,
      actor: actor || "Local Operator"
    });
    await writeState(state);
    res.status(201).json({ secret, restreamCandidate: restreamCandidateResponse(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/profiles/:profileId/secrets/:credentialType/rotate", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const secret = await storeCandidateSecret({
      state,
      profile,
      credentialType: req.params.credentialType,
      value: req.body.value,
      actor: req.body.actor || "Local Operator"
    });
    addAudit(state, profile, "Secret rotated", `${req.params.credentialType} was rotated in the Phase 5 secret store for Phase 6 Restream submission.`, "Secret");
    await writeState(state);
    res.json({ secret, restreamCandidate: restreamCandidateResponse(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/profiles/:profileId/restream-candidate/approve", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    profile.restreamCandidate = {
      ...ensureCandidateId(profile),
      approvalState: "approved",
      approvedBy: req.body?.approvedBy || "Local Operator",
      approvedAt: new Date().toISOString(),
      readyForSubmit: false
    };
    profile.connectorState = "candidate";
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Restream candidate approved", "Human approval recorded. Submit remains blocked until Restream submission is explicitly enabled.", "Approval");
    await writeState(state);
    res.json({ restreamCandidate: restreamCandidateResponse(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/profiles/:profileId/audit-events", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const event = addAudit(
      state,
      profile,
      req.body.action || "Manual audit event",
      req.body.detail || "Manual audit event recorded through the Phase 6 backend API.",
      req.body.eventType || "Manual"
    );
    await writeState(state);
    res.status(201).json({ event, state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/assets", async (_req, res, next) => {
  try {
    res.json({ assets: allAssets(await readState()) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/evidence", async (_req, res, next) => {
  try {
    res.json({ evidence: allEvidence(await readState()) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/profiles/:profileId/evidence/upload", upload.single("file"), async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findProfile(state, req.params.profileId);
    if (!profile) return res.status(404).json({ error: "profile_not_found" });
    const { sanitized, rejected } = stripPlaintextSecrets(req.body);
    if (rejected.length) return res.status(400).json({ error: "plaintext_secret_fields_rejected", rejected });
    const stored = await storeUploadedMedia({ root, state, profile, file: req.file, assetType: "evidence" });
    const evidence = {
      id: crypto.randomUUID(),
      title: sanitized.title || stored.originalName,
      evidenceType: sanitized.evidenceType || "profile",
      description: sanitized.description || "Proof file uploaded through Phase 4 media storage.",
      status: sanitized.status || "pending",
      sourceSystem: "frontend_upload",
      syncStatus: "needs_sync",
      createdAt: new Date().toISOString(),
      ...stored
    };
    profile.evidence = [evidence, ...(profile.evidence || [])];
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Evidence file uploaded", `${evidence.title || "Evidence"} was uploaded and stored at ${evidence.storagePath}.`, "Evidence");
    await writeState(state);
    res.status(201).json({ evidence, profile: sanitizeProfile(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/audit", async (_req, res, next) => {
  try {
    const state = await readState();
    res.json({ auditEvents: state.auditEvents });
  } catch (error) {
    next(error);
  }
});

app.get("/api/restream/candidates", async (_req, res, next) => {
  try {
    const state = await readState();
    res.json({ candidates: state.profiles.map((profile) => restreamCandidateResponse(profile)) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/restream/candidates/:candidateId/dry-run", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findCandidateProfile(state, req.params.candidateId);
    if (!profile) return res.status(404).json({ error: "restream_candidate_not_found" });
    const candidate = ensureCandidateId(profile);
    const readiness = computeReadiness(profile);
    const payload = buildSanitizedRestreamPayload(candidate);
    addAudit(state, profile, "Restream dry run generated", "A sanitized Restream channel payload preview was generated without resolving or transmitting secrets.", "Restream");
    await writeState(state);
    res.json({
      ok: payload.validation.ok && profile.restreamCandidate?.approvalState === "approved" && readiness.readyForPublishing,
      restream: getRestreamIntegrationStatus(),
      readiness,
      approvalState: candidate.approvalState || "draft",
      payload
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/restream/candidates/:candidateId/oauth/refresh", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findCandidateProfile(state, req.params.candidateId);
    if (!profile) return res.status(404).json({ error: "restream_candidate_not_found" });
    const brand = state.brands.find((item) => item.id === profile.brandId);
    const candidate = ensureCandidateId(profile);
    const refreshed = await refreshRestreamOAuthTokens({
      root,
      candidate,
      brandSlug: brand?.slug || profile.brandId,
      platformKey: profile.platformKey,
      actor: req.body?.actor || "Local Operator"
    });
    profile.restreamCandidate = {
      ...candidate,
      restreamAccessTokenSecretRef: refreshed.accessTokenSecretRef,
      restreamRefreshTokenSecretRef: refreshed.refreshTokenSecretRef,
      restreamTokenExpiresIn: refreshed.expiresIn,
      restreamTokenRefreshedAt: new Date().toISOString(),
      syncStatus: "needs_sync"
    };
    addAudit(state, profile, "Restream OAuth token refreshed", "Restream access and refresh tokens were rotated through the backend OAuth refresh flow. Only secret references were stored.", "Restream OAuth");
    await writeState(state);
    res.json({
      refreshed,
      restreamCandidate: restreamCandidateResponse(profile),
      state: stateResponse(state)
    });
  } catch (error) {
    if (error.message === "restream_oauth_secret_refs_missing") {
      return res.status(error.status).json({ error: error.message, missing: error.missing });
    }
    if (error.message === "restream_oauth_refresh_failed" || error.message === "restream_oauth_refresh_incomplete") {
      return res.status(error.status || 502).json({ error: error.message, restreamResponse: error.restream });
    }
    next(error);
  }
});

app.patch("/api/restream/candidates/:candidateId", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findCandidateProfile(state, req.params.candidateId);
    if (!profile) return res.status(404).json({ error: "restream_candidate_not_found" });
    const { sanitized, rejected } = stripPlaintextSecrets(req.body);
    if (rejected.length) return res.status(400).json({ error: "plaintext_secret_fields_rejected", rejected });
    profile.restreamCandidate = {
      ...ensureCandidateId(profile),
      ...sanitized,
      sourceSystem: "frontend",
      syncStatus: "needs_sync",
      updatedAt: new Date().toISOString()
    };
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Restream candidate updated", "Restream candidate was updated through the candidate API.", "Restream");
    await writeState(state);
    res.json({ restreamCandidate: restreamCandidateResponse(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/restream/candidates/:candidateId/approve", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findCandidateProfile(state, req.params.candidateId);
    if (!profile) return res.status(404).json({ error: "restream_candidate_not_found" });
    profile.restreamCandidate = {
      ...ensureCandidateId(profile),
      approvalState: "approved",
      approvedBy: req.body?.approvedBy || "Local Operator",
      approvedAt: new Date().toISOString(),
      readyForSubmit: false
    };
    profile.connectorState = "candidate";
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Restream candidate approved", "Human approval recorded through the candidate API.", "Approval");
    await writeState(state);
    res.json({ restreamCandidate: restreamCandidateResponse(profile), state: stateResponse(state) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/restream/candidates/:candidateId/submit", async (req, res, next) => {
  try {
    const state = await readState();
    const profile = findCandidateProfile(state, req.params.candidateId);
    if (!profile) return res.status(404).json({ error: "restream_candidate_not_found" });
    const candidate = ensureCandidateId(profile);
    const readiness = computeReadiness(profile);
    const validation = validateRestreamCandidate(candidate);
    if (!profile.restreamCandidate || candidate.approvalState !== "approved") {
      return res.status(409).json({ error: "candidate_not_approved", readiness });
    }
    if (!readiness.readyForPublishing) {
      return res.status(409).json({ error: "readiness_gates_not_satisfied", readiness });
    }
    if (!validation.ok) {
      return res.status(409).json({ error: "restream_candidate_invalid", validation, readiness });
    }
    const brand = state.brands.find((item) => item.id === profile.brandId);
    const result = await submitRestreamChannel({
      root,
      candidate,
      brandSlug: brand?.slug || profile.brandId,
      platformKey: profile.platformKey
    });
    profile.restreamCandidate = {
      ...candidate,
      restreamAccessTokenSecretRef: result.refreshed?.accessTokenSecretRef || candidate.restreamAccessTokenSecretRef,
      restreamRefreshTokenSecretRef: result.refreshed?.refreshTokenSecretRef || candidate.restreamRefreshTokenSecretRef,
      restreamTokenRefreshedAt: result.refreshed ? new Date().toISOString() : candidate.restreamTokenRefreshedAt,
      restreamChannelId: result.restreamResponse.id || result.restreamResponse.channelId || result.restreamResponse._id || "",
      restreamResponse: result.restreamResponse,
      submittedAt: new Date().toISOString(),
      readyForSubmit: false,
      syncStatus: "needs_sync"
    };
    profile.connectorState = "connected";
    applyDerivedReadiness(profile);
    addAudit(state, profile, "Restream channel submitted", "Approved candidate was submitted to Restream and sanitized response was recorded.", "Restream");
    await writeState(state);
    res.status(201).json({ restreamCandidate: restreamCandidateResponse(profile), restreamResponse: result.restreamResponse, state: stateResponse(state) });
  } catch (error) {
    if (error.message === "restream_access_token_missing") {
      return res.status(error.status).json({
        error: error.message,
        restream: getRestreamIntegrationStatus()
      });
    }
    if (error.message === "restream_candidate_invalid") {
      return res.status(error.status).json({ error: error.message, validation: error.validation });
    }
    if (error.message === "restream_oauth_secret_refs_missing") {
      return res.status(error.status).json({ error: error.message, missing: error.missing });
    }
    if (error.message === "restream_oauth_refresh_failed" || error.message === "restream_oauth_refresh_incomplete") {
      return res.status(error.status || 502).json({ error: error.message, restreamResponse: error.restream });
    }
    if (error.message === "restream_channel_create_failed") {
      return res.status(error.status || 502).json({ error: error.message, restreamResponse: error.restream });
    }
    next(error);
  }
});

app.get("/api/notion/status", (_req, res) => {
  res.json(notionStatus());
});

app.get("/api/secrets/status", (_req, res) => {
  res.json(secretStatus(root));
});

app.post("/api/notion/sync-plan", async (_req, res, next) => {
  try {
    res.json(buildNotionSyncPlan(await readState()));
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message === "unsupported_credential_type" || error.message === "secret_value_required" || error.message === "file_required" ? error.message : "internal_error", message: error.message });
});

if (isProduction) {
  console.log("OTA Social Engine using production static assets");
  app.use(express.static(path.join(root, "dist")));
  app.get("*", (_req, res) => res.sendFile(path.join(root, "dist", "app.html")));
} else {
  console.log("OTA Social Engine starting Vite middleware");
  const vite = await createViteServer({
    root,
    appType: "spa",
    server: { middlewareMode: true }
  });
  console.log("OTA Social Engine Vite middleware ready");
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`OTA Social Engine running at http://localhost:${port}`);
});
