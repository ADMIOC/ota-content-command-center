import { platformCatalog } from "../src/socialEngineData.js";

const secretFieldNames = new Set([
  "streamUrl",
  "streamKey",
  "rtmpUsername",
  "rtmpPassword",
  "restreamAccessToken"
]);

export function getPlatform(platformKey) {
  return platformCatalog.find((platform) => platform.key === platformKey);
}

export function isComplete(profile, field) {
  return Boolean(profile?.[field] && profile[field] !== "unknown");
}

export function missingRequiredFields(profile) {
  const required = getPlatform(profile?.platformKey)?.required || [];
  return required.filter((field) => !isComplete(profile, field));
}

export function computeReadiness(profile) {
  if (!profile) return { score: 0, missingRequiredFields: [], gates: {}, readyForConnector: false, readyForPublishing: false };
  const required = getPlatform(profile.platformKey)?.required || [];
  const missing = missingRequiredFields(profile);
  const gates = {
    requiredFieldsComplete: missing.length === 0,
    accountClaimed: profile.ownershipState === "ownership_claimed" || Boolean(profile.actualHandle),
    securityReviewed: profile.securityState === "verified" || profile.securityState === "not_required",
    profileReviewed: profile.profileState === "ready" || profile.profileState === "needs_review",
    humanApprovalRecorded: profile.restreamCandidate?.approvalState === "approved"
  };
  const fieldScore = required.length ? (required.length - missing.length) / required.length : 1;
  const gateScore = Object.values(gates).filter(Boolean).length / Object.values(gates).length;
  const score = Math.round(((fieldScore * 0.55) + (gateScore * 0.45)) * 100);
  return {
    score,
    missingRequiredFields: missing,
    gates,
    readyForConnector: gates.requiredFieldsComplete && gates.accountClaimed && gates.securityReviewed && gates.profileReviewed,
    readyForPublishing: gates.requiredFieldsComplete && gates.accountClaimed && gates.securityReviewed && gates.profileReviewed && gates.humanApprovalRecorded
  };
}

export function stripPlaintextSecrets(input = {}) {
  const rejected = Object.keys(input).filter((field) => secretFieldNames.has(field));
  const sanitized = { ...input };
  for (const field of rejected) delete sanitized[field];
  return { sanitized, rejected };
}

export function sanitizeRestreamCandidate(candidate = {}) {
  return {
    ...candidate,
    streamUrl: undefined,
    streamKey: undefined,
    rtmpUsername: undefined,
    rtmpPassword: undefined,
    restreamAccessToken: undefined,
    restreamAccessTokenSecretRef: candidate.restreamAccessTokenSecretRef,
    restreamClientIdSecretRef: candidate.restreamClientIdSecretRef,
    restreamClientSecretRef: candidate.restreamClientSecretRef,
    restreamRefreshTokenSecretRef: candidate.restreamRefreshTokenSecretRef,
    hasStreamUrlSecret: Boolean(candidate.streamUrlSecretRef),
    hasStreamKeySecret: Boolean(candidate.streamKeySecretRef),
    hasRtmpUsernameSecret: Boolean(candidate.rtmpUsernameSecretRef),
    hasRtmpPasswordSecret: Boolean(candidate.rtmpPasswordSecretRef),
    hasRestreamAccessTokenSecret: Boolean(candidate.restreamAccessTokenSecretRef),
    hasRestreamClientIdSecret: Boolean(candidate.restreamClientIdSecretRef),
    hasRestreamClientSecret: Boolean(candidate.restreamClientSecretRef),
    hasRestreamRefreshTokenSecret: Boolean(candidate.restreamRefreshTokenSecretRef)
  };
}

export function sanitizeProfile(profile = {}) {
  const readiness = computeReadiness(profile);
  return {
    ...profile,
    readiness,
    restreamCandidate: sanitizeRestreamCandidate(profile.restreamCandidate)
  };
}

export function summarizeProfile(profile = {}) {
  const readiness = computeReadiness(profile);
  return {
    id: profile.id,
    brandId: profile.brandId,
    platformKey: profile.platformKey,
    priority: profile.priority,
    targetHandle: profile.targetHandle,
    actualHandle: profile.actualHandle,
    profileUrl: profile.profileUrl,
    displayName: profile.displayName,
    ownershipState: profile.ownershipState,
    securityState: profile.securityState,
    profileState: profile.profileState,
    connectorState: profile.connectorState,
    publishingState: profile.publishingState,
    blocked: profile.blocked,
    blockedReason: profile.blockedReason,
    nextAction: profile.nextAction,
    readyForConnector: readiness.readyForConnector,
    readyForPublishing: readiness.readyForPublishing,
    readinessScore: readiness.score,
    missingRequiredFields: readiness.missingRequiredFields
  };
}
