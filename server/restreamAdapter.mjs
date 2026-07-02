import { readSecret, writeSecret } from "./secretStore.mjs";

const restreamApiBase = process.env.RESTREAM_API_BASE || "https://api.restream.io/v2";

const platformRules = {
  29: {
    name: "Custom RTMP",
    requiredSecretRefs: ["streamUrlSecretRef"],
    optionalSecretRefs: ["streamKeySecretRef", "rtmpUsernameSecretRef", "rtmpPasswordSecretRef"]
  },
  72: {
    name: "Telegram",
    requiredSecretRefs: ["streamUrlSecretRef", "streamKeySecretRef"],
    optionalSecretRefs: []
  },
  73: {
    name: "Instagram",
    requiredSecretRefs: ["streamKeySecretRef"],
    optionalSecretRefs: []
  },
  79: {
    name: "Substack",
    requiredSecretRefs: ["streamKeySecretRef"],
    optionalSecretRefs: []
  }
};

const secretFieldMap = {
  streamUrlSecretRef: { bodyField: "streamUrl", credentialType: "streamUrl" },
  streamKeySecretRef: { bodyField: "streamKey", credentialType: "streamKey" },
  rtmpUsernameSecretRef: { bodyField: "rtmpUsername", credentialType: "rtmpUsername" },
  rtmpPasswordSecretRef: { bodyField: "rtmpPassword", credentialType: "rtmpPassword" }
};

export function getRestreamIntegrationStatus() {
  return {
    enabled: Boolean(process.env.RESTREAM_ACCESS_TOKEN),
    supportsTokenSecretRef: true,
    supportsRefreshTokenFlow: true,
    apiBase: restreamApiBase,
    tokenEndpoint: "https://api.restream.io/oauth/token",
    requiredScope: "channels.write",
    supportedManualPlatformIds: Object.keys(platformRules).map(Number)
  };
}

export function validateRestreamCandidate(candidate = {}) {
  const platformId = Number(candidate.platformId);
  const errors = [];
  if (!platformId) errors.push("platform_id_required");
  const rule = platformRules[platformId];
  if (!rule) errors.push("unsupported_manual_platform");
  if (!candidate.displayName) errors.push("display_name_required");
  for (const field of rule?.requiredSecretRefs || []) {
    if (!candidate[field]) errors.push(`${field}_required`);
  }
  return {
    ok: errors.length === 0,
    errors,
    rule: rule ? { platformId, ...rule } : null
  };
}

export function buildSanitizedRestreamPayload(candidate = {}) {
  const platformId = Number(candidate.platformId);
  const validation = validateRestreamCandidate(candidate);
  return {
    endpoint: `POST ${restreamApiBase}/user/channels`,
    requiredScope: "channels.write",
    validation,
    body: {
      platformId,
      displayName: candidate.displayName || ""
    },
    secretRefs: {
      streamUrl: candidate.streamUrlSecretRef || "",
      streamKey: candidate.streamKeySecretRef || "",
      rtmpUsername: candidate.rtmpUsernameSecretRef || "",
      rtmpPassword: candidate.rtmpPasswordSecretRef || ""
    },
    optional: {
      instagramUsername: candidate.instagramUsername || ""
    }
  };
}

export async function buildResolvedRestreamPayload({ root, candidate }) {
  const validation = validateRestreamCandidate(candidate);
  if (!validation.ok) {
    const error = new Error("restream_candidate_invalid");
    error.status = 409;
    error.validation = validation;
    throw error;
  }

  const body = {
    platformId: Number(candidate.platformId),
    displayName: candidate.displayName
  };
  const fields = [...validation.rule.requiredSecretRefs, ...validation.rule.optionalSecretRefs];
  for (const field of fields) {
    if (!candidate[field]) continue;
    const mapping = secretFieldMap[field];
    body[mapping.bodyField] = await readSecret({ root, secretRef: candidate[field] });
  }
  if (candidate.instagramUsername) body.instagramUsername = candidate.instagramUsername;
  return body;
}

async function resolveRestreamAccessToken({ root, candidate }) {
  if (process.env.RESTREAM_ACCESS_TOKEN) return process.env.RESTREAM_ACCESS_TOKEN;
  if (candidate.restreamAccessTokenSecretRef) {
    return readSecret({ root, secretRef: candidate.restreamAccessTokenSecretRef });
  }
  return "";
}

export async function refreshRestreamOAuthTokens({ root, candidate, brandSlug, platformKey, actor = "Local Operator" }) {
  if (!candidate.restreamClientIdSecretRef || !candidate.restreamClientSecretRef || !candidate.restreamRefreshTokenSecretRef) {
    const error = new Error("restream_oauth_secret_refs_missing");
    error.status = 409;
    error.missing = {
      restreamClientIdSecretRef: !candidate.restreamClientIdSecretRef,
      restreamClientSecretRef: !candidate.restreamClientSecretRef,
      restreamRefreshTokenSecretRef: !candidate.restreamRefreshTokenSecretRef
    };
    throw error;
  }

  const clientId = await readSecret({ root, secretRef: candidate.restreamClientIdSecretRef });
  const clientSecret = await readSecret({ root, secretRef: candidate.restreamClientSecretRef });
  const refreshToken = await readSecret({ root, secretRef: candidate.restreamRefreshTokenSecretRef });
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://api.restream.io/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
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
    const error = new Error("restream_oauth_refresh_failed");
    error.status = response.status;
    error.restream = sanitizeRestreamResponse(data);
    throw error;
  }
  if (!data.access_token || !data.refresh_token) {
    const error = new Error("restream_oauth_refresh_incomplete");
    error.status = 502;
    error.restream = sanitizeRestreamResponse(data);
    throw error;
  }

  const accessSecret = await writeSecret({
    root,
    brandSlug,
    platformKey,
    credentialType: "restreamAccessToken",
    value: data.access_token,
    actor
  });
  const refreshSecret = await writeSecret({
    root,
    brandSlug,
    platformKey,
    credentialType: "restreamRefreshToken",
    value: data.refresh_token,
    actor
  });
  return {
    accessTokenSecretRef: accessSecret.secretRef,
    refreshTokenSecretRef: refreshSecret.secretRef,
    expiresIn: data.expires_in || "",
    scope: data.scope || "",
    tokenType: data.token_type || "Bearer"
  };
}

export async function submitRestreamChannel({ root, candidate, brandSlug, platformKey }) {
  let accessToken = await resolveRestreamAccessToken({ root, candidate });
  let refreshed = null;
  if (!accessToken && candidate.restreamClientIdSecretRef && candidate.restreamClientSecretRef && candidate.restreamRefreshTokenSecretRef) {
    refreshed = await refreshRestreamOAuthTokens({ root, candidate, brandSlug, platformKey, actor: "Restream Submit Adapter" });
    candidate.restreamAccessTokenSecretRef = refreshed.accessTokenSecretRef;
    candidate.restreamRefreshTokenSecretRef = refreshed.refreshTokenSecretRef;
    accessToken = await resolveRestreamAccessToken({ root, candidate });
  }
  if (!accessToken) {
    const error = new Error("restream_access_token_missing");
    error.status = 503;
    throw error;
  }
  const body = await buildResolvedRestreamPayload({ root, candidate });
  const response = await fetch(`${restreamApiBase}/user/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const error = new Error("restream_channel_create_failed");
    error.status = response.status;
    error.restream = sanitizeRestreamResponse(data);
    throw error;
  }
  return {
    restreamResponse: sanitizeRestreamResponse(data),
    refreshed
  };
}

export function sanitizeRestreamResponse(response = {}) {
  const cloned = JSON.parse(JSON.stringify(response));
  for (const key of ["streamUrl", "streamKey", "rtmpUsername", "rtmpPassword", "accessToken", "token"]) {
    if (key in cloned) cloned[key] = "[redacted]";
  }
  return cloned;
}
