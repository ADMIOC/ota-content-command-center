const { execFile } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);
const rootDir = __dirname;
const port = Number(process.env.PORT || 4180);
const jobs = new Map();
const restreamOAuthStates = new Map();
const heygenCliPath = path.join(process.env.HOME || "", ".local/bin/heygen");
const restreamApiBase = "https://api.restream.io/v2";

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".md": "text/markdown",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function escapeHtmlForHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getSecretStatus(...names) {
  const found = names.find((name) => Boolean(process.env[name]));
  return {
    configured: Boolean(found),
    env: found || names[0],
    aliases: names,
    valueLength: found ? process.env[found].length : 0
  };
}

async function getCredential(name) {
  if (process.env[name]) return process.env[name];
  try {
    return await runCli("security", ["find-generic-password", "-a", process.env.USER || "", "-s", name, "-w"], 5000);
  } catch {
    return "";
  }
}

async function setCredential(name, value) {
  if (!value) return;
  await execFileAsync(
    "security",
    ["add-generic-password", "-a", process.env.USER || "", "-s", name, "-w", value, "-U"],
    { timeout: 5000, maxBuffer: 1024 * 1024 }
  );
}

function publicIntegrationStatus(id, status) {
  return {
    id,
    configured: Boolean(status.configured),
    live: Boolean(status.live),
    state: status.state || (status.configured ? "configured" : "missing"),
    detail: status.detail,
    env: status.env,
    valueLength: status.valueLength || 0,
    metadata: status.metadata || null,
    checkedAt: new Date().toISOString()
  };
}

function getHeyGenModelGuidance() {
  return {
    source: "https://developers.heygen.com/models",
    endpoint: "POST /v3/videos",
    defaultEngine: "avatar_iv",
    engineRules: [
      "Use Avatar IV by default; omit the engine field to select it automatically.",
      "Use Avatar V only when the selected avatar look lists avatar_v in supported_api_engines.",
      "Check Avatar V eligibility with GET /v3/avatars/looks/{look_id} before requesting engine.type=avatar_v.",
      "Do not route new work to Avatar III; it is legacy-only and not available through POST /v3/videos."
    ],
    supportedAvatarTypes: {
      avatar_iv: ["studio_avatar", "digital_twin", "photo_avatar", "image", "prompt"],
      avatar_v: ["studio_avatar", "digital_twin", "photo_avatar", "prompt"]
    },
    avatarIvOnlyControls: ["motion_prompt", "expressiveness", "arbitrary image input"]
  };
}

function getRestreamOAuthGuidance() {
  return {
    source: "https://developers.restream.io/guide/getting-started",
    auth: "OAuth 2.0 authorization code flow",
    appCredentials: ["RESTREAM_CLIENT_ID", "RESTREAM_CLIENT_SECRET", "RESTREAM_REDIRECT_URI"],
    tokenCredentials: ["RESTREAM_ACCESS_TOKEN", "RESTREAM_REFRESH_TOKEN"],
    validationEndpoint: "GET https://api.restream.io/v2/user/profile",
    requiredScopes: ["profile.read", "channels.read", "stream.read", "chat.read", "storage.read", "clips.read"],
    availableApis: ["channels", "events", "live-stream-analytics", "storage", "clips", "chat-websocket"]
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text.slice(0, 180) };
    }
  }
  return { response, json };
}

function normalizeRestreamTokenPayload(json = {}) {
  return {
    accessToken: json.access_token || json.accessToken || "",
    refreshToken: json.refresh_token || json.refreshToken || "",
    scope: json.scope || "",
    accessTokenExpiresAt: json.accessTokenExpiresAt || json.access_token_expires_at || "",
    refreshTokenExpiresAt: json.refreshTokenExpiresAt || json.refresh_token_expires_at || ""
  };
}

async function persistRestreamTokenPayload(json = {}) {
  const tokens = normalizeRestreamTokenPayload(json);
  if (!tokens.accessToken || !tokens.refreshToken) {
    return {
      ok: false,
      detail: "Restream token response did not include both access and refresh tokens."
    };
  }

  await setCredential("RESTREAM_ACCESS_TOKEN", tokens.accessToken);
  await setCredential("RESTREAM_REFRESH_TOKEN", tokens.refreshToken);
  if (tokens.accessTokenExpiresAt) await setCredential("RESTREAM_ACCESS_TOKEN_EXPIRES_AT", tokens.accessTokenExpiresAt);
  if (tokens.refreshTokenExpiresAt) await setCredential("RESTREAM_REFRESH_TOKEN_EXPIRES_AT", tokens.refreshTokenExpiresAt);
  if (tokens.scope) await setCredential("RESTREAM_SCOPE", tokens.scope);

  return { ok: true, ...tokens };
}

async function refreshRestreamTokens() {
  const clientId = await getCredential("RESTREAM_CLIENT_ID");
  const clientSecret = await getCredential("RESTREAM_CLIENT_SECRET");
  const refreshToken = await getCredential("RESTREAM_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    return {
      ok: false,
      status: 401,
      detail: "Restream refresh requires RESTREAM_CLIENT_ID, RESTREAM_CLIENT_SECRET, and RESTREAM_REFRESH_TOKEN."
    };
  }

  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", refreshToken);

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const { response, json } = await fetchJson("https://api.restream.io/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      detail: json?.error?.message || json?.message || `Restream token refresh returned HTTP ${response.status}.`,
      data: json || null
    };
  }

  const persisted = await persistRestreamTokenPayload(json);
  return {
    ...persisted,
    status: persisted.ok ? 200 : 502
  };
}

function buildRestreamApiUrl(pathname, query = {}) {
  const apiUrl = new URL(`${restreamApiBase}${pathname}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      apiUrl.searchParams.set(key, value);
    }
  });
  return apiUrl.toString();
}

async function restreamApiRequest(pathname, options = {}, retryOnUnauthorized = true) {
  const accessToken = await getCredential("RESTREAM_ACCESS_TOKEN");
  if (!accessToken) {
    return {
      ok: false,
      status: 401,
      detail: "Restream OAuth access token is missing. Complete the Restream OAuth flow first."
    };
  }

  const { query, headers, ...fetchOptions } = options;
  const { response, json } = await fetchJson(buildRestreamApiUrl(pathname, query), {
    ...fetchOptions,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(headers || {})
    }
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refresh = await refreshRestreamTokens();
    if (!refresh.ok) {
      return {
        ok: false,
        status: response.status,
        detail: `Restream request was unauthorized and token refresh failed: ${refresh.detail}`,
        data: json || null
      };
    }
    return restreamApiRequest(pathname, options, false);
  }

  return {
    ok: response.ok,
    status: response.status,
    detail: response.ok
      ? "Restream request completed."
      : json?.error?.message || json?.message || json?.error || `Restream returned HTTP ${response.status}.`,
    data: json || null
  };
}

function restreamPayload(result, label) {
  return {
    ok: result.ok,
    label,
    status: result.status,
    detail: result.detail,
    data: result.data || null,
    checkedAt: new Date().toISOString()
  };
}

function sendRestreamResult(res, result, label) {
  sendJson(res, result.ok ? 200 : result.status || 500, restreamPayload(result, label));
}

async function getRestreamOperationsSnapshot(query = {}) {
  const requests = {
    channels: restreamApiRequest("/user/channels"),
    upcomingEvents: restreamApiRequest("/user/events/upcoming", {
      query: {
        source: query.source,
        scheduled: query.scheduled
      }
    }),
    inProgressEvents: restreamApiRequest("/user/events/in-progress"),
    eventHistory: restreamApiRequest("/user/events/history", {
      query: {
        page: query.page || "1",
        limit: query.limit || "10"
      }
    }),
    storageFiles: restreamApiRequest("/user/storage/files"),
    clipProjects: restreamApiRequest("/user/clips/projects", {
      query: {
        limit: query.clipLimit || "10",
        cursor: query.cursor,
        sortBy: query.sortBy
      }
    })
  };

  const entries = await Promise.all(
    Object.entries(requests).map(async ([key, request]) => {
      try {
        return [key, restreamPayload(await request, key)];
      } catch (error) {
        return [
          key,
          {
            ok: false,
            label: key,
            status: 500,
            detail: error.message,
            data: null,
            checkedAt: new Date().toISOString()
          }
        ];
      }
    })
  );

  const operations = Object.fromEntries(entries);
  return {
    ok: entries.some(([, result]) => result.ok),
    checkedAt: new Date().toISOString(),
    operations
  };
}

async function checkElevenLabs() {
  const secret = getSecretStatus("ELEVENLABS_API_KEY");
  if (!secret.configured) {
    return publicIntegrationStatus("elevenlabs", {
      ...secret,
      state: "missing",
      detail: "ELEVENLABS_API_KEY is not available to the backend process."
    });
  }

  try {
    const { response, json } = await fetchJson("https://api.elevenlabs.io/v1/user/subscription", {
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
    });
    const characterLimit = json?.character_limit || json?.credit_limit || "unknown";
    const characterCount = json?.character_count || json?.credits_used || 0;
    return publicIntegrationStatus("elevenlabs", {
      ...secret,
      live: response.ok,
      state: response.ok ? "connected" : "credential-check-failed",
      detail: response.ok
        ? `Connected. Tier ${json?.tier || "unknown"} with usage ${characterCount}/${characterLimit}.`
        : `ElevenLabs returned HTTP ${response.status}.`
    });
  } catch (error) {
    return publicIntegrationStatus("elevenlabs", {
      ...secret,
      state: "connection-error",
      detail: `ElevenLabs check failed: ${error.message}`
    });
  }
}

async function checkBunny() {
  const secret = getSecretStatus("BUNNY_ACCESS_KEY", "BUNNY_API_KEY");
  const storageSecret = getSecretStatus("BUNNY_STORAGE_PASSWORD", "BUNNY_STORAGE_API_KEY");
  const storageZoneConfigured = Boolean(process.env.BUNNY_STORAGE_ZONE);
  const storageReady = Boolean(storageSecret.configured && storageZoneConfigured);
  const key = process.env[secret.env];
  if (!secret.configured) {
    return publicIntegrationStatus("bunny", {
      ...secret,
      state: "missing",
      detail: "BUNNY_ACCESS_KEY or BUNNY_API_KEY is not available to the backend process."
    });
  }

  try {
    const { response, json } = await fetchJson("https://api.bunny.net/pullzone", {
      headers: { AccessKey: key }
    });
    const zoneCount = Array.isArray(json) ? json.length : "unknown";
    return publicIntegrationStatus("bunny", {
      ...secret,
      live: response.ok && storageReady,
      state: response.ok
        ? storageReady
          ? "connected"
          : "storage-credentials-missing"
        : "credential-check-failed",
      detail: response.ok
        ? storageReady
          ? `Connected. Pull zones visible: ${zoneCount}; storage upload credentials are configured.`
          : `Bunny account API connected with ${zoneCount} pull zones visible, but upload automation needs BUNNY_STORAGE_ZONE and BUNNY_STORAGE_PASSWORD.`
        : `Bunny returned HTTP ${response.status}.`,
      metadata: {
        accountApiConnected: response.ok,
        pullZoneCount: zoneCount,
        storageZoneConfigured,
        storageCredentialConfigured: storageSecret.configured,
        uploadReady: storageReady
      }
    });
  } catch (error) {
    return publicIntegrationStatus("bunny", {
      ...secret,
      state: "connection-error",
      detail: `Bunny check failed: ${error.message}`
    });
  }
}

async function runCli(command, args, timeout = 12_000) {
  const { stdout, stderr } = await execFileAsync(command, args, {
    timeout,
    maxBuffer: 1024 * 1024
  });
  return `${stdout || ""}${stderr || ""}`.trim();
}

async function checkHiggsfield() {
  try {
    const output = await runCli("higgsfield", ["account", "status", "--json"]);
    let account = null;
    try {
      account = JSON.parse(output);
    } catch {
      account = { raw: output };
    }
    const workspaceName = account?.workspace?.name || account?.workspaceName || "authorized workspace";
    return publicIntegrationStatus("higgsfield", {
      configured: true,
      live: true,
      state: "connected",
      env: "higgsfield auth login",
      detail: `CLI authenticated for ${workspaceName}.`
    });
  } catch (error) {
    return publicIntegrationStatus("higgsfield", {
      configured: false,
      state: "needs-login",
      env: "higgsfield auth login",
      detail: `Higgsfield CLI is not action-ready: ${error.message.split("\n")[0]}`
    });
  }
}

async function checkHeyGen() {
  const modelGuidance = getHeyGenModelGuidance();
  const apiKey = process.env.HEYGEN_API_KEY;

  if (apiKey) {
    try {
      const { response, json } = await fetchJson("https://api.heygen.com/v3/users/me", {
        headers: { "x-api-key": apiKey }
      });
      return publicIntegrationStatus("heygen", {
        configured: true,
        live: response.ok,
        state: response.ok ? "connected" : "api-key-check-failed",
        env: "HEYGEN_API_KEY",
        valueLength: apiKey.length,
        detail: response.ok
          ? `HeyGen API key is connected for ${json?.data?.email || json?.data?.name || "the current account"}. MCP OAuth is optional while API-key routing is available.`
          : `HEYGEN_API_KEY is present, but HeyGen returned HTTP ${response.status}.`,
        metadata: {
          ...modelGuidance,
          authMode: "api-key"
        }
      });
    } catch (error) {
      return publicIntegrationStatus("heygen", {
        configured: true,
        state: "api-key-connection-error",
        env: "HEYGEN_API_KEY",
        valueLength: apiKey.length,
        detail: `HEYGEN_API_KEY is present, but the live HeyGen API check failed: ${error.message}`,
        metadata: {
          ...modelGuidance,
          authMode: "api-key"
        }
      });
    }
  }

  try {
    const output = await runCli("codex", ["mcp", "list"]);
    const line = output
      .split("\n")
      .find((item) => item.toLowerCase().includes("heygen") && item.toLowerCase().includes("mcp.heygen.com"));
    const loggedIn = line && !line.toLowerCase().includes("not logged in");
    if (loggedIn) {
      return publicIntegrationStatus("heygen", {
        configured: true,
        live: true,
        state: "connected",
        env: "codex mcp login heygen",
        detail:
          "HeyGen MCP is installed and authorized. Model routing is staged for Avatar IV by default and Avatar V after look eligibility.",
        metadata: {
          ...modelGuidance,
          authMode: "mcp-oauth"
        }
      });
    }
  } catch {
    // Fall through to CLI detection. MCP is preferred, but not required.
  }

  if (fs.existsSync(heygenCliPath)) {
    try {
      const output = await runCli(heygenCliPath, ["auth", "status"]);
      let auth = null;
      try {
        auth = JSON.parse(output);
      } catch {
        auth = { raw: output };
      }
      const cliAuthenticated = Boolean(auth?.data) && !auth?.error;
      return publicIntegrationStatus("heygen", {
        configured: true,
        live: cliAuthenticated,
        state: cliAuthenticated ? "connected" : "needs-api-key",
        env: "HEYGEN_API_KEY",
        detail: cliAuthenticated
          ? "HeyGen CLI is authenticated. Backend can route HeyGen actions through CLI/API-key mode while MCP OAuth remains optional."
          : "HeyGen CLI is installed, but no API key is configured. MCP OAuth is failing at grant time, so use HEYGEN_API_KEY as the fallback.",
        metadata: {
          ...modelGuidance,
          authMode: cliAuthenticated ? "cli" : "cli-needs-api-key",
          cliPath: heygenCliPath
        }
      });
    } catch (error) {
      const output = `${error.stdout || ""}${error.stderr || ""}`.trim();
      if (output.toLowerCase().includes("no api key found") || output.toLowerCase().includes("auth_error")) {
        return publicIntegrationStatus("heygen", {
          configured: true,
          live: false,
          state: "needs-api-key",
          env: "HEYGEN_API_KEY",
          detail:
            "HeyGen CLI is installed, but no API key is configured. MCP OAuth is failing at grant time, so use HEYGEN_API_KEY as the fallback.",
          metadata: {
            ...modelGuidance,
            authMode: "cli-needs-api-key",
            cliPath: heygenCliPath
          }
        });
      }
      return publicIntegrationStatus("heygen", {
        configured: true,
        state: "cli-check-failed",
        env: "HEYGEN_API_KEY",
        detail: `HeyGen CLI is installed, but auth status failed: ${error.message.split("\n")[0]}`,
        metadata: {
          ...modelGuidance,
          authMode: "cli-check-failed",
          cliPath: heygenCliPath
        }
      });
    }
  }

  try {
    const output = await runCli("codex", ["mcp", "list"]);
    const line = output
      .split("\n")
      .find((item) => item.toLowerCase().includes("heygen") && item.toLowerCase().includes("mcp.heygen.com"));
    return publicIntegrationStatus("heygen", {
      configured: Boolean(line),
      live: false,
      state: line ? "needs-oauth-or-api-key" : "not-installed",
      env: line ? "codex mcp login heygen or HEYGEN_API_KEY" : "codex mcp add heygen",
      detail: line
        ? "HeyGen MCP is installed but OAuth grant is failing. Configure HEYGEN_API_KEY or use HeyGen support to unblock MCP OAuth."
        : "HeyGen MCP is not installed and HeyGen CLI is not available.",
      metadata: modelGuidance
    });
  } catch (error) {
    return publicIntegrationStatus("heygen", {
      configured: false,
      state: "not-installed",
      env: "codex mcp add heygen or HEYGEN_API_KEY",
      detail: `Could not inspect Codex MCP status: ${error.message.split("\n")[0]}`,
      metadata: modelGuidance
    });
  }
}

function checkConfiguredOnly(id, envNames, label) {
  const secret = getSecretStatus(...envNames);
  return publicIntegrationStatus(id, {
    ...secret,
    live: false,
    state: secret.configured ? "credential-present" : "missing",
    detail: secret.configured
      ? `${label} credential is present. Action endpoint still needs a platform-specific live test before production use.`
      : `${label} credential is not available to the backend process.`
  });
}

function sanitizeBlotatoAccounts(items = []) {
  return items.map((account) => ({
    id: account.id,
    platform: account.platform,
    fullname: account.fullname || "",
    username: account.username || "",
    needsPageId: ["facebook", "linkedin"].includes(account.platform)
  }));
}

function summarizePlatforms(accounts) {
  return accounts.reduce((summary, account) => {
    summary[account.platform] = (summary[account.platform] || 0) + 1;
    return summary;
  }, {});
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildBlotatoPostPayload(body) {
  const textParts = [body.caption, body.hashtags, body.cta].filter(Boolean);
  const text = textParts.join("\n\n").trim();
  const mediaUrls = isHttpUrl(body.mediaSource) ? [body.mediaSource] : [];
  const target = { targetType: body.platform };
  const post = {
    accountId: body.accountId,
    content: {
      text,
      mediaUrls,
      platform: body.platform
    },
    target
  };

  if (body.platform === "tiktok") {
    post.content.isDraft = true;
    post.target = {
      ...target,
      privacyLevel: "SELF_ONLY",
      disabledComments: false,
      disabledDuet: false,
      disabledStitch: false,
      isBrandedContent: false,
      isYourBrand: true,
      isAiGenerated: true
    };
  }

  const payload = { post };
  if (body.platform !== "tiktok") payload.scheduledTime = body.scheduledTime;
  return payload;
}

async function createBlotatoDraft(body) {
  const secret = getSecretStatus("BLOTATO_API_KEY");
  if (!secret.configured) {
    return {
      ok: false,
      status: 400,
      detail: "BLOTATO_API_KEY is not available to the backend process."
    };
  }
  if (!body.humanApproval || !body.safeModeAcknowledged) {
    return {
      ok: false,
      status: 403,
      detail: "Human approval and safe mode acknowledgement are required before creating a Blotato draft."
    };
  }
  if (!body.accountId || !body.platform || !body.caption) {
    return {
      ok: false,
      status: 400,
      detail: "accountId, platform, and caption are required."
    };
  }

  const scheduledDate = body.scheduledTime ? new Date(body.scheduledTime) : null;
  if (body.platform !== "tiktok") {
    if (!scheduledDate || Number.isNaN(scheduledDate.getTime())) {
      return {
        ok: false,
        status: 400,
        detail: "Non-TikTok Blotato posts require a safe scheduledTime so the backend does not publish immediately."
      };
    }
    if (scheduledDate.getTime() < Date.now() + 10 * 60 * 1000) {
      return {
        ok: false,
        status: 400,
        detail: "scheduledTime must be at least 10 minutes in the future."
      };
    }
  }

  const payload = buildBlotatoPostPayload(body);
  const { response, json } = await fetchJson("https://backend.blotato.com/v2/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "blotato-api-key": process.env.BLOTATO_API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      detail: json?.error?.message || json?.message || `Blotato returned HTTP ${response.status}.`,
      data: json || null
    };
  }

  return {
    ok: true,
    status: response.status,
    mode: body.platform === "tiktok" ? "tiktok-draft" : "scheduled-safe-draft",
    detail: body.platform === "tiktok"
      ? "Blotato TikTok draft request accepted."
      : "Blotato scheduled post request accepted as a safe draft handoff.",
    postSubmissionId: json?.postSubmissionId || json?.id || "",
    data: json || null
  };
}

async function getBlotatoAccounts(platform = "") {
  const secret = getSecretStatus("BLOTATO_API_KEY");
  if (!secret.configured) {
    return {
      ok: false,
      status: 0,
      accounts: [],
      secret,
      detail: "BLOTATO_API_KEY is not available to the backend process."
    };
  }

  const url = new URL("https://backend.blotato.com/v2/users/me/accounts");
  if (platform) url.searchParams.set("platform", platform);

  const { response, json } = await fetchJson(url.toString(), {
    headers: { "blotato-api-key": process.env.BLOTATO_API_KEY }
  });

  return {
    ok: response.ok,
    status: response.status,
    accounts: sanitizeBlotatoAccounts(Array.isArray(json?.items) ? json.items : []),
    secret,
    detail: response.ok ? "Blotato accounts request completed." : `Blotato returned HTTP ${response.status}.`
  };
}

async function checkBlotato() {
  try {
    const result = await getBlotatoAccounts();
    const accountCount = result.accounts.length;
    return publicIntegrationStatus("blotato", {
      ...result.secret,
      live: result.ok && accountCount > 0,
      state: result.ok ? (accountCount ? "connected" : "needs-social-accounts") : "credential-check-failed",
      detail: result.ok
        ? accountCount
          ? `Connected. ${accountCount} social account${accountCount === 1 ? "" : "s"} available for publishing handoff.`
          : "Blotato credential is valid, but no connected social accounts were returned."
        : result.detail,
      metadata: {
        endpoint: "GET /v2/users/me/accounts",
        source: "https://help.blotato.com/api/accounts",
        supportedPlatforms: ["twitter", "instagram", "linkedin", "facebook", "tiktok", "pinterest", "threads", "bluesky", "youtube"],
        platformCounts: summarizePlatforms(result.accounts),
        accounts: result.accounts
      }
    });
  } catch (error) {
    const secret = getSecretStatus("BLOTATO_API_KEY");
    return publicIntegrationStatus("blotato", {
      ...secret,
      state: secret.configured ? "connection-error" : "missing",
      detail: secret.configured
        ? `Blotato accounts check failed: ${error.message}`
        : "BLOTATO_API_KEY is not available to the backend process."
    });
  }
}

async function checkRestream() {
  const guidance = getRestreamOAuthGuidance();
  const clientId = await getCredential("RESTREAM_CLIENT_ID");
  const clientSecret = await getCredential("RESTREAM_CLIENT_SECRET");
  const redirectUri = await getCredential("RESTREAM_REDIRECT_URI");
  const accessToken = await getCredential("RESTREAM_ACCESS_TOKEN");
  const refreshToken = await getCredential("RESTREAM_REFRESH_TOKEN");
  const hasClientId = Boolean(clientId);
  const hasClientSecret = Boolean(clientSecret);
  const hasRedirectUri = Boolean(redirectUri);
  const hasAppCredentials = hasClientId && hasClientSecret && hasRedirectUri;
  const hasRefreshToken = Boolean(refreshToken);

  if (!hasAppCredentials) {
    return publicIntegrationStatus("restream", {
      configured: false,
      live: false,
      state: "oauth-app-missing",
      env: "RESTREAM_CLIENT_ID + RESTREAM_CLIENT_SECRET + RESTREAM_REDIRECT_URI",
      detail:
        "Restream uses OAuth 2.0, not a single API key. Create a Restream developer application and add client id, client secret, and redirect URI.",
      metadata: {
        ...guidance,
        configured: {
          clientId: hasClientId,
          clientSecret: hasClientSecret,
          redirectUri: hasRedirectUri,
          accessToken: Boolean(accessToken),
          refreshToken: hasRefreshToken
        }
      }
    });
  }

  if (!accessToken) {
    return publicIntegrationStatus("restream", {
      configured: true,
      live: false,
      state: "oauth-token-missing",
      env: "RESTREAM_ACCESS_TOKEN + RESTREAM_REFRESH_TOKEN",
      detail:
        "Restream OAuth app credentials are configured, but no access token is available. Complete the OAuth authorize/code-exchange flow before live broadcast automation.",
      metadata: {
        ...guidance,
        configured: {
          clientId: true,
          clientSecret: true,
          redirectUri: true,
          accessToken: false,
          refreshToken: hasRefreshToken
        }
      }
    });
  }

  try {
    const result = await restreamApiRequest("/user/profile");
    const profile = result.data || {};
    return publicIntegrationStatus("restream", {
      configured: true,
      live: result.ok,
      state: result.ok ? "connected" : "oauth-token-invalid",
      env: "RESTREAM_ACCESS_TOKEN",
      valueLength: accessToken.length,
      detail: result.ok
        ? `Restream OAuth token is connected for ${profile?.email || profile?.username || "the authorized account"}.`
        : `Restream profile validation returned HTTP ${result.status}. Refresh or re-authorize the OAuth token.`,
      metadata: {
        ...guidance,
        authMode: "oauth2",
        profile: result.ok
          ? {
              id: profile?.id || null,
              username: profile?.username || "",
              email: profile?.email || ""
            }
          : null,
        configured: {
          clientId: true,
          clientSecret: true,
          redirectUri: true,
          accessToken: true,
          refreshToken: hasRefreshToken
        }
      }
    });
  } catch (error) {
    return publicIntegrationStatus("restream", {
      configured: true,
      live: false,
      state: "connection-error",
      env: "RESTREAM_ACCESS_TOKEN",
      valueLength: accessToken.length,
      detail: `Restream OAuth profile check failed: ${error.message}`,
      metadata: guidance
    });
  }
}

function pruneRestreamOAuthStates() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [state, record] of restreamOAuthStates.entries()) {
    if (record.createdAt < cutoff) restreamOAuthStates.delete(state);
  }
}

async function createRestreamAuthorizeUrl() {
  const clientId = await getCredential("RESTREAM_CLIENT_ID");
  const clientSecret = await getCredential("RESTREAM_CLIENT_SECRET");
  const redirectUri = await getCredential("RESTREAM_REDIRECT_URI");

  if (!clientId || !clientSecret || !redirectUri) {
    return {
      ok: false,
      status: 400,
      detail:
        "Restream OAuth app credentials are missing. Add RESTREAM_CLIENT_ID, RESTREAM_CLIENT_SECRET, and RESTREAM_REDIRECT_URI first."
    };
  }

  pruneRestreamOAuthStates();
  const state = crypto.randomUUID();
  restreamOAuthStates.set(state, {
    createdAt: Date.now(),
    redirectUri
  });

  const url = new URL("https://api.restream.io/login");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);

  return {
    ok: true,
    state,
    authUrl: url.toString(),
    redirectUri
  };
}

async function exchangeRestreamCode(code, state) {
  pruneRestreamOAuthStates();
  const stateRecord = restreamOAuthStates.get(state);
  if (!stateRecord) {
    return {
      ok: false,
      status: 400,
      detail: "Restream OAuth state was not recognized or expired. Start the OAuth flow again."
    };
  }

  const clientId = await getCredential("RESTREAM_CLIENT_ID");
  const clientSecret = await getCredential("RESTREAM_CLIENT_SECRET");
  const redirectUri = await getCredential("RESTREAM_REDIRECT_URI");
  if (!clientId || !clientSecret || !redirectUri) {
    return {
      ok: false,
      status: 400,
      detail: "Restream OAuth app credentials are missing during token exchange."
    };
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("redirect_uri", redirectUri);
  body.set("code", code);

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const { response, json } = await fetchJson("https://api.restream.io/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      detail: json?.error?.message || json?.message || `Restream token exchange returned HTTP ${response.status}.`
    };
  }

  const persisted = await persistRestreamTokenPayload(json);
  if (!persisted.ok) {
    return {
      ok: false,
      status: 502,
      detail: persisted.detail
    };
  }

  restreamOAuthStates.delete(state);

  return {
    ok: true,
    scope: persisted.scope || "",
    accessTokenExpiresAt: persisted.accessTokenExpiresAt || "",
    refreshTokenExpiresAt: persisted.refreshTokenExpiresAt || ""
  };
}

async function getIntegrationStatuses() {
  const [elevenLabs, bunny, higgsfield, heygen, blotato, restream] = await Promise.all([
    checkElevenLabs(),
    checkBunny(),
    checkHiggsfield(),
    checkHeyGen(),
    checkBlotato(),
    checkRestream()
  ]);

  return {
    checkedAt: new Date().toISOString(),
    integrations: {
      elevenlabs: elevenLabs,
      bunny,
      higgsfield,
      heygen,
      blotato,
      remotion: checkConfiguredOnly("remotion", ["REMOTION_RENDER_TOKEN"], "Remotion render"),
      descript: checkConfiguredOnly("descript", ["DESCRIPT_API_KEY"], "Descript"),
      restream
    }
  };
}

function createJob(service, action, payload) {
  const now = new Date().toISOString();
  const job = {
    id: crypto.randomUUID(),
    service,
    action,
    status: "queued",
    progress: 0,
    createdAt: now,
    updatedAt: now,
    events: [
      {
        at: now,
        status: "queued",
        message: `${service}:${action} accepted by the OTA backend action layer.`
      }
    ],
    result: null,
    payload: sanitizePayload(payload)
  };
  jobs.set(job.id, job);
  runJob(job, payload).catch((error) => {
    appendJobEvent(job, "failed", `Job failed: ${error.message}`, 100);
  });
  return job;
}

function sanitizePayload(payload) {
  return {
    execute: Boolean(payload.execute),
    campaign: payload.campaignManifest?.campaign || payload.campaign?.name || payload.campaign || "Unknown campaign",
    brand: payload.campaignManifest?.brand || payload.brand || "Unknown brand",
    source: payload.source
      ? {
          service: payload.source.service || "",
          projectId: payload.source.projectId || "",
          clipId: payload.source.clipId || ""
        }
      : null,
    publishingPackage: payload.publishingPackage
      ? {
          captionPresent: Boolean(payload.publishingPackage.caption),
          hashtagsPresent: Boolean(payload.publishingPackage.hashtags),
          platformNotesPresent: Boolean(payload.publishingPackage.platformNotes),
          restreamClipTitle: payload.publishingPackage.restreamClipPackage?.hook || "",
          viralScore: payload.publishingPackage.restreamClipPackage?.viralScore || null
        }
      : null
  };
}

function appendJobEvent(job, status, message, progress) {
  job.status = status;
  job.progress = progress;
  job.updatedAt = new Date().toISOString();
  job.events.push({
    at: job.updatedAt,
    status,
    message
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runJob(job, payload) {
  appendJobEvent(job, "validating", "Validating credentials, campaign context, and approval requirements.", 18);
  await sleep(250);
  const statuses = await getIntegrationStatuses();
  const serviceStatus = statuses.integrations[job.service];

  if (serviceStatus && !serviceStatus.configured) {
    appendJobEvent(job, "blocked", serviceStatus.detail, 100);
    job.result = { serviceStatus };
    return;
  }

  appendJobEvent(job, "planning", "Planning the next action and keeping paid/publishing actions approval-gated.", 42);
  await sleep(250);

  if (job.action === "check" || job.action === "status") {
    appendJobEvent(job, "completed", `${job.service} status check completed.`, 100);
    job.result = { serviceStatus };
    return;
  }

  if (job.service === "elevenlabs" && job.action === "generate-audio") {
    if (!payload.execute) {
      appendJobEvent(
        job,
        "needs_approval",
        "ElevenLabs is connected. Audio generation is staged but requires execute=true after human approval to spend credits.",
        100
      );
      job.result = {
        mode: "staged",
        nextStep: "Send execute=true with an approved script, voice_id, and output destination."
      };
      return;
    }
    appendJobEvent(job, "blocked", "Live ElevenLabs audio generation needs an approved voice_id and script payload.", 100);
    job.result = { requiredFields: ["voice_id", "script"] };
    return;
  }

  if (job.service === "bunny" && job.action === "upload-manifest") {
    const storageReady = Boolean(process.env.BUNNY_STORAGE_ZONE && process.env.BUNNY_STORAGE_PASSWORD);
    if (!storageReady) {
      appendJobEvent(
        job,
        "blocked",
        "Bunny account API is connected, but storage upload needs BUNNY_STORAGE_ZONE and BUNNY_STORAGE_PASSWORD.",
        100
      );
      job.result = { requiredSecrets: ["BUNNY_STORAGE_ZONE", "BUNNY_STORAGE_PASSWORD"] };
      return;
    }
  }

  if (job.service === "blotato" && job.action === "create-draft") {
    if (!serviceStatus?.live) {
      appendJobEvent(
        job,
        "blocked",
        serviceStatus?.detail || "Connect at least one Blotato social account before creating publishing drafts.",
        100
      );
      job.result = { serviceStatus };
      return;
    }

    appendJobEvent(
      job,
      "needs_approval",
      "Blotato accounts are connected. Draft creation is staged until final Bunny media URL, caption package, accountId, target platform, and human approval are attached.",
      100
    );
    job.result = {
      mode: "staged",
      requiredFields: ["accountId", "platform", "caption", "mediaUrls", "humanApproval"],
      accounts: serviceStatus.metadata?.accounts || [],
      platformCounts: serviceStatus.metadata?.platformCounts || {}
    };
    return;
  }

  const actionNotes = {
    higgsfield: "Higgsfield CLI is ready. Production generation remains staged until prompt, source media, and credit approval are attached.",
    heygen:
      "HeyGen avatar action is staged. Complete MCP OAuth or configure HEYGEN_API_KEY before live avatar/lip-sync generation. Route new videos through Avatar IV by default; request Avatar V only after look eligibility confirms supported_api_engines includes avatar_v.",
    blotato: "Blotato publishing draft is staged. Live scheduling requires connected accountId, final media URL, caption package, and human publish approval.",
    remotion: "Remotion render action is staged. Add render token or local render worker before live rendering.",
    descript: "Descript edit action is staged. Add Descript API access or on-platform project handoff before live editing.",
    restream:
      "Restream live/clip action is staged. Configure Restream OAuth app credentials and complete the OAuth token flow before live operations.",
    analytics: "Signal sweep queued. Connect social analytics endpoints to replace MVP scoring with live performance data.",
    repurpose: "Repurpose plan queued. Connect source performance data and publishing targets for closed-loop execution."
  };

  appendJobEvent(job, "needs_approval", actionNotes[job.service] || "Action staged and waiting for approval.", 100);
  job.result = { mode: "staged", serviceStatus };
}

function getJob(id) {
  return jobs.get(id);
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(rootDir, requestedPath));

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

async function handleApi(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      service: "ota-social-engine-backend-action-layer",
      checkedAt: new Date().toISOString()
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/integrations/status") {
    sendJson(res, 200, await getIntegrationStatuses());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/oauth/start") {
    const result = await createRestreamAuthorizeUrl();
    if (!result.ok) {
      sendJson(res, result.status || 500, result);
      return;
    }
    if (url.searchParams.get("redirect") === "1") {
      res.writeHead(302, { Location: result.authUrl });
      res.end();
      return;
    }
    sendJson(res, 200, result);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/oauth/callback") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end("<h1>Restream OAuth failed</h1><p>Missing authorization code or state.</p>");
      return;
    }

    const result = await exchangeRestreamCode(code, state);
    if (!result.ok) {
      res.writeHead(result.status || 500, { "Content-Type": "text/html" });
      res.end(`<h1>Restream OAuth failed</h1><p>${escapeHtmlForHtml(result.detail)}</p>`);
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <h1>Restream connected</h1>
      <p>OAuth tokens were stored locally in Keychain. You can return to the OTA Social Engine Command Center.</p>
      <p><a href="/index.html#agent-operations-layer">Open Command Center</a></p>
    `);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/operations") {
    sendJson(res, 200, await getRestreamOperationsSnapshot(Object.fromEntries(url.searchParams.entries())));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/channels") {
    sendRestreamResult(res, await restreamApiRequest("/user/channels"), "channels");
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/events/upcoming") {
    sendRestreamResult(
      res,
      await restreamApiRequest("/user/events/upcoming", {
        query: {
          source: url.searchParams.get("source"),
          scheduled: url.searchParams.get("scheduled")
        }
      }),
      "upcomingEvents"
    );
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/events/in-progress") {
    sendRestreamResult(res, await restreamApiRequest("/user/events/in-progress"), "inProgressEvents");
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/events/history") {
    sendRestreamResult(
      res,
      await restreamApiRequest("/user/events/history", {
        query: {
          page: url.searchParams.get("page") || "1",
          limit: url.searchParams.get("limit") || "10"
        }
      }),
      "eventHistory"
    );
    return;
  }

  const restreamEventMatch = url.pathname.match(/^\/api\/restream\/events\/([^/]+)$/);
  if (req.method === "GET" && restreamEventMatch) {
    sendRestreamResult(
      res,
      await restreamApiRequest(`/user/events/${encodeURIComponent(restreamEventMatch[1])}`),
      "event"
    );
    return;
  }

  const restreamEventRecordingsMatch = url.pathname.match(/^\/api\/restream\/events\/([^/]+)\/recordings$/);
  if (req.method === "GET" && restreamEventRecordingsMatch) {
    sendRestreamResult(
      res,
      await restreamApiRequest(`/user/events/${encodeURIComponent(restreamEventRecordingsMatch[1])}/recordings`),
      "eventRecordings"
    );
    return;
  }

  const restreamRecordingDownloadMatch = url.pathname.match(
    /^\/api\/restream\/events\/([^/]+)\/recordings\/download-url$/
  );
  if (req.method === "POST" && restreamRecordingDownloadMatch) {
    const body = await readJson(req);
    if (!body.fileName) {
      sendJson(res, 400, { ok: false, detail: "fileName is required for a Restream recording download URL." });
      return;
    }
    sendRestreamResult(
      res,
      await restreamApiRequest(`/user/events/${encodeURIComponent(restreamRecordingDownloadMatch[1])}/recordings/download-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: body.fileName })
      }),
      "recordingDownloadUrl"
    );
    return;
  }

  const restreamEventAnalyticsMatch = url.pathname.match(/^\/api\/restream\/events\/([^/]+)\/analytics\/viewers$/);
  if (req.method === "GET" && restreamEventAnalyticsMatch) {
    sendRestreamResult(
      res,
      await restreamApiRequest(`/user/events/${encodeURIComponent(restreamEventAnalyticsMatch[1])}/analytics/viewers`),
      "viewerAnalytics"
    );
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/storage/files") {
    sendRestreamResult(res, await restreamApiRequest("/user/storage/files"), "storageFiles");
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/restream/clips/projects") {
    sendRestreamResult(
      res,
      await restreamApiRequest("/user/clips/projects", {
        query: {
          limit: url.searchParams.get("limit") || "10",
          cursor: url.searchParams.get("cursor"),
          sortBy: url.searchParams.get("sortBy")
        }
      }),
      "clipProjects"
    );
    return;
  }

  const restreamClipProjectMatch = url.pathname.match(/^\/api\/restream\/clips\/projects\/([^/]+)$/);
  if (req.method === "GET" && restreamClipProjectMatch) {
    sendRestreamResult(
      res,
      await restreamApiRequest(`/user/clips/projects/${encodeURIComponent(restreamClipProjectMatch[1])}`),
      "clipProject"
    );
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/blotato/accounts") {
    try {
      const result = await getBlotatoAccounts(url.searchParams.get("platform") || "");
      if (!result.ok) {
        sendJson(res, result.status || 500, {
          ok: false,
          detail: result.detail,
          accounts: []
        });
        return;
      }
      sendJson(res, 200, {
        ok: true,
        accounts: result.accounts,
        platformCounts: summarizePlatforms(result.accounts),
        checkedAt: new Date().toISOString()
      });
    } catch (error) {
      sendJson(res, 500, { ok: false, detail: error.message, accounts: [] });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/blotato/create-draft") {
    try {
      const body = await readJson(req);
      const result = await createBlotatoDraft(body);
      sendJson(res, result.ok ? 201 : result.status || 500, {
        ok: result.ok,
        mode: result.mode || "blocked",
        detail: result.detail,
        postSubmissionId: result.postSubmissionId || "",
        data: result.data || null,
        checkedAt: new Date().toISOString()
      });
    } catch (error) {
      sendJson(res, 500, { ok: false, detail: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/jobs") {
    const body = await readJson(req);
    if (!body.service || !body.action) {
      sendJson(res, 400, { error: "service and action are required" });
      return;
    }
    const job = createJob(body.service, body.action, body);
    sendJson(res, 202, { job });
    return;
  }

  const jobMatch = url.pathname.match(/^\/api\/jobs\/([^/]+)$/);
  if (req.method === "GET" && jobMatch) {
    const job = getJob(jobMatch[1]);
    if (!job) {
      sendJson(res, 404, { error: "Job not found" });
      return;
    }
    sendJson(res, 200, { job });
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res).catch((error) => {
      sendJson(res, 500, { error: error.message });
    });
    return;
  }
  serveStatic(req, res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`OTA Social Engine backend action layer running at http://127.0.0.1:${port}`);
});
