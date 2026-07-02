const socialStorageKey = "ota-social-profile-by-brand-v1";

const platformCatalog = [
  {
    key: "youtube",
    name: "YouTube",
    priority: "P0",
    required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "bannerAsset"],
    restreamNote: "Use connected Restream channel where possible or Custom RTMP when stream details are supplied."
  },
  {
    key: "instagram",
    name: "Instagram",
    priority: "P0",
    required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "businessAccountStatus"],
    restreamPlatformId: 73,
    restreamNote: "Manual Restream path supports platform ID 73 with stream key and optional Instagram username."
  },
  {
    key: "facebook_page",
    name: "Facebook Page",
    priority: "P0",
    required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "bannerAsset", "businessAccountStatus"],
    restreamNote: "Use connected channel where possible; Facebook Group manual path is platform ID 37."
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    priority: "P0",
    required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "websiteUrl"],
    restreamNote: "Profile readiness first; documented manual Restream add table does not cover LinkedIn."
  },
  {
    key: "tiktok",
    name: "TikTok",
    priority: "P0",
    required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "businessAccountStatus"],
    restreamNote: "Verify live eligibility and connector path before channel work."
  },
  {
    key: "x_twitter",
    name: "X / Twitter",
    priority: "P1",
    required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset"],
    restreamNote: "Profile readiness only until an approved streaming destination is confirmed."
  },
  {
    key: "threads",
    name: "Threads",
    priority: "P1",
    required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset"],
    restreamNote: "Profile readiness only in the first pass."
  },
  {
    key: "twitch",
    name: "Twitch",
    priority: "P1",
    required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset"],
    restreamPlatformId: 29,
    restreamNote: "Custom RTMP can be used when stream URL and stream key are available."
  },
  {
    key: "custom_rtmp",
    name: "Custom RTMP",
    priority: "P1",
    required: ["displayName", "websiteUrl"],
    restreamPlatformId: 29,
    restreamNote: "Restream platform ID 29 requires stream URL; stream key is optional."
  },
  {
    key: "telegram",
    name: "Telegram",
    priority: "P2",
    required: ["actualHandle", "profileUrl", "displayName"],
    restreamPlatformId: 72,
    restreamNote: "Manual Restream path requires stream URL and stream key."
  },
  {
    key: "substack",
    name: "Substack",
    priority: "P2",
    required: ["actualHandle", "profileUrl", "displayName", "websiteUrl"],
    restreamPlatformId: 79,
    restreamNote: "Manual Restream path requires stream key."
  }
];

const restreamPlatforms = [
  { id: "", name: "No Restream manual channel" },
  { id: 29, name: "Custom RTMP", needsUrl: true, needsKey: false },
  { id: 37, name: "Facebook Group", needsUrl: false, needsKey: true },
  { id: 49, name: "Steam", needsUrl: true, needsKey: true },
  { id: 60, name: "Nimo", needsUrl: true, needsKey: true },
  { id: 61, name: "Naver", needsUrl: true, needsKey: true },
  { id: 68, name: "Mixcloud", needsUrl: false, needsKey: true },
  { id: 72, name: "Telegram", needsUrl: true, needsKey: true },
  { id: 73, name: "Instagram", needsUrl: false, needsKey: true },
  { id: 74, name: "Amazon Live", needsUrl: true, needsKey: true },
  { id: 78, name: "Custom SRT", needsUrl: true, needsKey: false },
  { id: 79, name: "Substack", needsUrl: false, needsKey: true },
  { id: 80, name: "Mux", needsUrl: false, needsKey: true },
  { id: 81, name: "Custom WHIP", needsUrl: true, needsKey: false },
  { id: 82, name: "Custom HLS", needsUrl: true, needsKey: false }
];

const platformGuidance = {
  youtube: {
    profile:
      "For YouTube, complete the confirmed channel handle, public channel URL, display name, channel bio, website link, avatar, and banner. Do not mark the profile ready until the channel owner or manager access has been proven.",
    media:
      "Add the channel avatar, banner art, thumbnail or cover templates, and any intro or channel-trailer video. Record dimensions for every asset because YouTube crops banners and thumbnails differently across desktop, TV, and mobile surfaces.",
    evidence:
      "Capture non-secret proof of channel ownership, manager access, live-stream eligibility, channel URL, profile review, and any Restream or studio connection checks.",
    restream:
      "Prefer a verified Restream-connected YouTube destination. If the workflow uses manual streaming details, store only secret references for stream URL or stream key and keep the channel blocked until human approval is logged."
  },
  instagram: {
    profile:
      "For Instagram, complete the actual handle, profile URL, display name, bio, website link, avatar, and professional or business account status. Confirm Meta account linkage before treating the profile as connector-ready.",
    media:
      "Add the avatar, story highlight covers, pinned-post media, launch reels, and brand-safe cover images. Record dimensions so square, portrait, and story assets stay organized instead of being reused blindly.",
    evidence:
      "Capture non-secret proof of account ownership, Meta or Business Manager access, MFA status, profile review, professional account status, and any live access or connector check.",
    restream:
      "Restream documents a manual Instagram channel path using platform ID 73 with a stream key and optional Instagram username. Save the stream key as a secret reference only and approve the candidate before any API write."
  },
  facebook_page: {
    profile:
      "For Facebook, complete the page or group URL, display name, public description, website link, avatar, cover image, and Business Manager or admin status. Separate page readiness from group readiness.",
    media:
      "Add page avatar, cover image, event cover images, proof screenshots, and pinned media. Include dimensions because Facebook crops cover and event images across placements.",
    evidence:
      "Capture non-secret proof of page admin access, Business Manager ownership, role level, MFA status, public profile review, and destination or group routing notes.",
    restream:
      "Use a connected Facebook destination when possible. Restream documents Facebook Group manual channel ID 37 requiring a stream key; store the stream key as a secret reference and require approval before submission."
  },
  linkedin: {
    profile:
      "For LinkedIn, complete the company page URL, public name, description, website, logo, and banner if used. Confirm the operator has company-page admin authority before connector work.",
    media:
      "Add the company logo, cover image, article or newsletter cover templates, proof screenshots, and any launch video assets. Record dimensions so the brand page remains consistent across LinkedIn placements.",
    evidence:
      "Capture non-secret proof of company page admin access, public page URL, profile review, brand-compliance approval, and any connector feasibility notes.",
    restream:
      "The documented Restream manual add table does not list LinkedIn. Keep LinkedIn as profile and evidence readiness unless a verified connected-channel path is confirmed in Restream."
  },
  tiktok: {
    profile:
      "For TikTok, complete the actual handle, profile URL, display name, bio, website field if available, avatar, and business or creator account status. Verify live eligibility before connector work.",
    media:
      "Add the avatar, profile-safe launch videos, pinned video covers, and proof screenshots. Record dimensions and duration so short-form assets are not confused with static profile art.",
    evidence:
      "Capture non-secret proof of account ownership, MFA or recovery owner, business or creator account status, live access, public profile review, and connector feasibility.",
    restream:
      "Treat TikTok as connector/manual-readiness until the exact Restream path is verified for the account. Do not use Custom RTMP unless TikTok provides valid stream details for the operator."
  },
  x_twitter: {
    profile:
      "For X, complete the handle, profile URL, display name, bio, website, avatar, and header image. Keep API or paid-tier decisions separate from basic profile readiness.",
    media:
      "Add avatar, header image, pinned-post media, proof screenshots, and launch video or image assets. Record dimensions for header and pinned media to avoid off-brand cropping.",
    evidence:
      "Capture non-secret proof of handle ownership, recovery owner, MFA status, public profile review, and any paid/API or connector decision notes.",
    restream:
      "Keep X as profile-readiness only unless an approved streaming destination is confirmed. Do not assume Restream manual channel support from the current documented add-channel table."
  },
  threads: {
    profile:
      "For Threads, complete the handle, profile URL, display name, bio, avatar, and Instagram linkage notes. Confirm the linked Instagram account before connector decisions.",
    media:
      "Add avatar, launch post media, proof screenshots, and any reusable profile assets. Record dimensions so Threads assets are not mixed with Instagram-only creative by mistake.",
    evidence:
      "Capture non-secret proof of Threads account access, linked Instagram access, MFA or recovery owner, public profile review, and manual posting fallback notes.",
    restream:
      "Keep Threads as profile-readiness only in this MVP. Do not create a Restream manual channel unless a verified destination path is later documented."
  },
  twitch: {
    profile:
      "For Twitch, complete the channel URL, display name, bio, website or panels reference, avatar, and channel category notes. Confirm creator dashboard access before connector work.",
    media:
      "Add avatar, offline banner, profile panels, stream overlay references, proof screenshots, and intro video assets. Record dimensions for channel art and overlay assets.",
    evidence:
      "Capture non-secret proof of channel ownership, creator dashboard access, stream key source, moderation owner, MFA status, and profile review.",
    restream:
      "Use Custom RTMP only when the operator has valid stream URL and stream key details. Store both as secret references and require approval before any Restream write."
  },
  custom_rtmp: {
    profile:
      "For Custom RTMP, record the destination name, destination owner, website or destination URL, and operational notes. This is a technical destination, not a social account by itself.",
    media:
      "Attach destination logos, event graphics, thumbnail or holding-screen assets, proof screenshots, and any destination-specific video requirements. Record dimensions for every image or video asset.",
    evidence:
      "Capture non-secret proof that the destination is authorized, who owns the stream endpoint, where credentials are stored, and whether a non-destructive test has succeeded.",
    restream:
      "Restream platform ID 29 requires a stream URL and may use a stream key plus optional RTMP auth. Store credential values as secret references only and do not submit without human approval."
  },
  telegram: {
    profile:
      "For Telegram, complete the channel or group URL, public name, handle if available, description, and owner or admin notes. Confirm whether the stream destination is a channel, group, or event workflow.",
    media:
      "Add channel avatar, post media, proof screenshots, and event graphics. Record dimensions for images and videos so Telegram-specific creative stays clear.",
    evidence:
      "Capture non-secret proof of admin access, channel or group URL, recovery owner, public profile review, and stream destination setup notes.",
    restream:
      "Restream documents Telegram platform ID 72 requiring stream URL and stream key. Store both as secret references and require approval before channel creation."
  },
  substack: {
    profile:
      "For Substack, complete the publication URL, publication name, description, website or custom domain, owner, and profile image. Treat publication readiness separately from streaming readiness.",
    media:
      "Add publication logo, cover images, newsletter header art, proof screenshots, and any video or audio assets tied to the profile. Record dimensions for every image and video asset.",
    evidence:
      "Capture non-secret proof of publication ownership, admin access, custom domain or profile review, and any stream destination details.",
    restream:
      "Restream documents Substack platform ID 79 requiring a stream key. Store the key as a secret reference only and approve the candidate before submission."
  }
};

const stateCycle = {
  ownershipState: ["target_identified", "human_action_required", "ownership_claimed"],
  securityState: ["unknown", "incomplete", "verified"],
  profileState: ["incomplete", "needs_review", "ready"],
  connectorState: ["none", "candidate", "connected", "blocked"]
};

let state = loadSocialState();
let selectedBrandId = state.selectedBrandId || state.brands[0]?.id || "";
let selectedProfileId = state.selectedProfileId || getProfilesForBrand(selectedBrandId)[0]?.id || "";

const els = {
  metricBrands: document.querySelector("#metricBrands"),
  metricReady: document.querySelector("#metricReady"),
  metricBlocked: document.querySelector("#metricBlocked"),
  brandSelect: document.querySelector("#brandSelect"),
  platformSearch: document.querySelector("#platformSearch"),
  stateFilter: document.querySelector("#stateFilter"),
  profileList: document.querySelector("#profileList"),
  profileEmptyState: document.querySelector("#profileEmptyState"),
  profileView: document.querySelector("#profileView"),
  brandKicker: document.querySelector("#brandKicker"),
  platformTitle: document.querySelector("#platformTitle"),
  profileMeta: document.querySelector("#profileMeta"),
  profileScore: document.querySelector("#profileScore"),
  ownershipStateLabel: document.querySelector("#ownershipStateLabel"),
  securityStateLabel: document.querySelector("#securityStateLabel"),
  profileStateLabel: document.querySelector("#profileStateLabel"),
  connectorStateLabel: document.querySelector("#connectorStateLabel"),
  targetHandle: document.querySelector("#targetHandle"),
  actualHandle: document.querySelector("#actualHandle"),
  profileUrl: document.querySelector("#profileUrl"),
  displayName: document.querySelector("#displayName"),
  bio: document.querySelector("#bio"),
  websiteUrl: document.querySelector("#websiteUrl"),
  businessStatus: document.querySelector("#businessStatus"),
  profileImage: document.querySelector("#profileImage"),
  bannerAsset: document.querySelector("#bannerAsset"),
  profileNotes: document.querySelector("#profileNotes"),
  profileGuidance: document.querySelector("#profileGuidance"),
  mediaGuidance: document.querySelector("#mediaGuidance"),
  evidenceGuidance: document.querySelector("#evidenceGuidance"),
  restreamGuidance: document.querySelector("#restreamGuidance"),
  mediaAssetList: document.querySelector("#mediaAssetList"),
  evidenceList: document.querySelector("#evidenceList"),
  requiredSummary: document.querySelector("#requiredSummary"),
  requiredFields: document.querySelector("#requiredFields"),
  restreamPlatform: document.querySelector("#restreamPlatform"),
  restreamDisplayName: document.querySelector("#restreamDisplayName"),
  streamUrlRef: document.querySelector("#streamUrlRef"),
  streamKeyRef: document.querySelector("#streamKeyRef"),
  rtmpUserRef: document.querySelector("#rtmpUserRef"),
  rtmpPasswordRef: document.querySelector("#rtmpPasswordRef"),
  instagramUsername: document.querySelector("#instagramUsername"),
  restreamApprovalState: document.querySelector("#restreamApprovalState"),
  restreamStatus: document.querySelector("#restreamStatus"),
  payloadPreview: document.querySelector("#payloadPreview"),
  auditCount: document.querySelector("#auditCount"),
  auditTimeline: document.querySelector("#auditTimeline"),
  platformDialog: document.querySelector("#platformDialog"),
  platformForm: document.querySelector("#platformForm"),
  newPlatformKey: document.querySelector("#newPlatformKey"),
  mediaDialog: document.querySelector("#mediaDialog"),
  mediaForm: document.querySelector("#mediaForm"),
  mediaFile: document.querySelector("#mediaFile"),
  assetWidth: document.querySelector("#assetWidth"),
  assetHeight: document.querySelector("#assetHeight"),
  assetDuration: document.querySelector("#assetDuration"),
  evidenceDialog: document.querySelector("#evidenceDialog"),
  evidenceForm: document.querySelector("#evidenceForm"),
  toast: document.querySelector("#toast")
};

function makeId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createSeedState() {
  const brands = [
    {
      id: makeId(),
      name: "Own The Algo Podcast",
      slug: "otap",
      domain: "podcast.ownthealgo.com",
      owner: "Jey",
      status: "active"
    },
    {
      id: makeId(),
      name: "CRS Healthcare Solutions",
      slug: "crshcs",
      domain: "crshcs.com",
      owner: "Jeff",
      status: "draft"
    },
    {
      id: makeId(),
      name: "The VFO",
      slug: "thevfo",
      domain: "thevfo.com",
      owner: "Mike",
      status: "draft"
    }
  ];

  const otap = brands[0];
  const profiles = ["youtube", "instagram", "facebook_page", "linkedin", "tiktok", "custom_rtmp"].map(
    (platformKey) => createProfile(otap.id, platformKey)
  );
  profiles[0].targetHandle = "@ownthealgo";
  profiles[0].actualHandle = "@ownthealgo";
  profiles[0].profileUrl = "https://www.youtube.com/@ownthealgo";
  profiles[0].displayName = "Agentic Jey";
  profiles[0].bio =
    "Own The Algo helps underrepresented entrepreneurs become AI-native and agentic. We turn high-signal AI, automation, and founder/operator insights into practical playbooks, workflows, and validation lessons for builders, creators, operators, and investors navigating the agentic economy.";
  profiles[0].websiteUrl = "https://podcast.ownthealgo.com";
  profiles[0].profileImageAsset = "OTAP YouTube avatar candidate - Hero Closeup Bright";
  profiles[0].bannerAsset = "OTAP YouTube banner candidate - DataBurst Gabriel Centered";
  profiles[0].businessAccountStatus = "not_required";
  profiles[0].ownershipState = "ownership_claimed";
  profiles[0].securityState = "incomplete";
  profiles[0].profileState = "needs_review";
  profiles[0].notes =
    "Profile content is sourced from the OTAP Show Bible, OTAP Brand Instructions, and local Own The Algo Brand Kit. Proof screenshots show logged-in access to @ownthealgo, including Customize channel, Manage videos, and YouTube Studio customization. Current public channel name is Agentic Jey. Remaining gates: MFA/recovery owner, final brand/name decision, YouTube banner safe-area review, actual upload confirmation, live eligibility, and Restream destination status.";
  profiles[0].mediaAssets = [
    {
      id: makeId(),
      assetType: "avatar",
      assetName: "OTAP YouTube avatar candidate - Hero Closeup Bright",
      fileName: "OTA_Square_Hero_Closeup_Bright_2048x2048.png",
      mimeType: "image/png",
      fileSizeBytes: 0,
      width: 2048,
      height: 2048,
      durationSeconds: "",
      usageContext: "Candidate YouTube profile picture / avatar for @ownthealgo. Use only after brand/name alignment review.",
      description:
        "Local source path: /Users/blackchain/Documents/New project 2/Own_The_Algo_Brand_Kit/01_Source_Assets/Square/OTA_Square_Hero_Closeup_Bright_2048x2048.png. YouTube Studio states profile pictures should be at least 98 x 98 pixels and 4MB or less; this candidate exceeds the pixel minimum but file size and final crop still need review.",
      approvalState: "needs_review",
      previewDataUrl:
        "file:///Users/blackchain/Documents/New%20project%202/Own_The_Algo_Brand_Kit/01_Source_Assets/Square/OTA_Square_Hero_Closeup_Bright_2048x2048.png",
      createdAt: "2026-06-30T20:55:00.000Z"
    },
    {
      id: makeId(),
      assetType: "banner",
      assetName: "OTAP YouTube banner candidate - DataBurst Gabriel Centered",
      fileName: "OTA_UltraWide_DataBurst_Gabriel_Centered_2752x1536.png",
      mimeType: "image/png",
      fileSizeBytes: 0,
      width: 2752,
      height: 1536,
      durationSeconds: "",
      usageContext: "Candidate YouTube channel banner for @ownthealgo. Requires YouTube safe-area crop review before approval.",
      description:
        "Local source path: /Users/blackchain/Documents/New project 2/Own_The_Algo_Brand_Kit/01_Source_Assets/Ultra_Wide_Headers/OTA_UltraWide_DataBurst_Gabriel_Centered_2752x1536.png. YouTube Studio states banner images should be at least 2048 x 1152 pixels and 6MB or less; this candidate exceeds the pixel minimum but needs safe-area and file-size review.",
      approvalState: "needs_review",
      previewDataUrl:
        "file:///Users/blackchain/Documents/New%20project%202/Own_The_Algo_Brand_Kit/01_Source_Assets/Ultra_Wide_Headers/OTA_UltraWide_DataBurst_Gabriel_Centered_2752x1536.png",
      createdAt: "2026-06-30T20:56:00.000Z"
    }
  ];
  profiles[0].evidence = [
    {
      id: makeId(),
      evidenceType: "ownership",
      title: "Logged-in YouTube channel access proof",
      evidenceUrl: "",
      description:
        "Screenshots supplied on 2026-06-30 show @ownthealgo with Customize channel, Manage videos, and YouTube Studio customization access. This proves operator access, not MFA/recovery readiness.",
      status: "accepted",
      createdAt: "2026-06-30T20:20:00.000Z"
    },
    {
      id: makeId(),
      evidenceType: "profile",
      title: "Profile copy and media candidates sourced",
      evidenceUrl: "https://app.notion.com/p/351a90a45ed780e6b41dd079631dc920",
      description:
        "YouTube About copy was drafted from OTAP source material, and avatar/banner candidates were sourced from the local Own The Algo Brand Kit. Candidate assets still require human visual approval and upload confirmation.",
      status: "accepted",
      createdAt: "2026-06-30T20:58:00.000Z"
    },
    {
      id: makeId(),
      evidenceType: "approval",
      title: "Brand-name alignment decision required",
      evidenceUrl: "",
      description:
        "The active YouTube display name is Agentic Jey while the operating profile is Own The Algo Podcast. Human owner must decide whether to keep the channel personality-led or rename it for the podcast brand.",
      status: "pending",
      createdAt: "2026-06-30T20:59:00.000Z"
    }
  ];
  profiles[1].targetHandle = "@ownthealgo";
  profiles[2].targetHandle = "Own The Algo";
  profiles[3].targetHandle = "Own The Algo";
  profiles[4].targetHandle = "@ownthealgo";
  profiles[5].displayName = "OTAP Custom RTMP";

  return {
    brands,
    profiles,
    auditEvents: [],
    selectedBrandId: otap.id,
    selectedProfileId: profiles[0].id
  };
}

function createProfile(brandId, platformKey) {
  const platform = getPlatform(platformKey);
  return {
    id: makeId(),
    brandId,
    platformKey,
    targetHandle: "",
    actualHandle: "",
    profileUrl: "",
    displayName: "",
    bio: "",
    websiteUrl: "",
    profileImageAsset: "",
    bannerAsset: "",
    businessAccountStatus: "unknown",
    ownershipState: "human_action_required",
    securityState: "unknown",
    profileState: "incomplete",
    connectorState: "none",
    publishingState: "none",
    blocked: false,
    notes: platform?.restreamNote || "",
    mediaAssets: [],
    evidence: [],
    restreamCandidate: {
      platformId: platform?.restreamPlatformId || "",
      displayName: "",
      streamUrlSecretRef: "",
      streamKeySecretRef: "",
      rtmpUsernameSecretRef: "",
      rtmpPasswordSecretRef: "",
      instagramUsername: "",
      approvalState: "draft",
      restreamChannelId: "",
      lastErrorCode: "",
      lastErrorMessage: ""
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function loadSocialState() {
  const stored = localStorage.getItem(socialStorageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.brands) && Array.isArray(parsed.profiles)) {
        parsed.auditEvents = parsed.auditEvents || [];
        parsed.profiles.forEach((profile) => {
          profile.mediaAssets = profile.mediaAssets || [];
          profile.evidence = profile.evidence || [];
        });
        return parsed;
      }
    } catch (error) {
      console.warn("Could not load social profile state", error);
    }
  }
  return createSeedState();
}

function saveSocialState() {
  state.selectedBrandId = selectedBrandId;
  state.selectedProfileId = selectedProfileId;
  localStorage.setItem(socialStorageKey, JSON.stringify(state));
}

function getPlatform(key) {
  return platformCatalog.find((platform) => platform.key === key);
}

function getBrand(id = selectedBrandId) {
  return state.brands.find((brand) => brand.id === id);
}

function getProfilesForBrand(brandId = selectedBrandId) {
  return state.profiles.filter((profile) => profile.brandId === brandId);
}

function getSelectedProfile() {
  return state.profiles.find((profile) => profile.id === selectedProfileId);
}

function formatLabel(value) {
  if (!value) return "None";
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusClass(value) {
  return String(value || "draft").replace(/_/g, "-");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getProfileCompletion(profile) {
  const platform = getPlatform(profile.platformKey);
  const required = platform?.required || [];
  const requiredComplete = required.filter((field) => isFieldComplete(profile, field)).length;
  const evidenceComplete = ["ownership", "security", "profile"].filter((type) =>
    profile.evidence.some((item) => item.evidenceType === type && item.status === "accepted")
  ).length;
  const stateComplete = [
    profile.ownershipState === "ownership_claimed",
    profile.securityState === "verified",
    profile.profileState === "ready",
    profile.connectorState === "candidate" || profile.connectorState === "connected"
  ].filter(Boolean).length;
  const total = Math.max(required.length, 1) + 3 + 4;
  return Math.round(((requiredComplete + evidenceComplete + stateComplete) / total) * 100);
}

function getProfileReadiness(profile) {
  if (profile.blocked || profile.connectorState === "blocked") return "blocked";
  const candidate = profile.restreamCandidate || {};
  if (candidate.approvalState === "approved" || candidate.approvalState === "connected") return "restream_ready";
  if (profile.connectorState === "candidate" || profile.connectorState === "connected") return "connector_candidate";
  return "human_action_required";
}

function isFieldComplete(profile, field) {
  if (field === "businessAccountStatus") {
    return ["not_required", "pending", "verified"].includes(profile.businessAccountStatus);
  }
  return Boolean(profile[field]);
}

function render() {
  ensureSelectedProfile();
  renderMetrics();
  renderBrandSelect();
  renderPlatformOptions();
  renderRestreamOptions();
  renderProfileList();
  renderProfile();
  saveSocialState();
}

function ensureSelectedProfile() {
  if (!selectedBrandId || !getBrand(selectedBrandId)) selectedBrandId = state.brands[0]?.id || "";
  const profiles = getProfilesForBrand(selectedBrandId);
  if (!profiles.some((profile) => profile.id === selectedProfileId)) {
    selectedProfileId = profiles[0]?.id || "";
  }
}

function renderMetrics() {
  const readiness = state.profiles.map(getProfileReadiness);
  els.metricBrands.textContent = state.brands.length;
  els.metricReady.textContent = readiness.filter((item) => item === "restream_ready" || item === "connector_candidate").length;
  els.metricBlocked.textContent = readiness.filter((item) => item === "blocked").length;
}

function renderBrandSelect() {
  const current = els.brandSelect.value;
  els.brandSelect.innerHTML = state.brands
    .map((brand) => `<option value="${brand.id}">${escapeHtml(brand.name)}</option>`)
    .join("");
  els.brandSelect.value = selectedBrandId || current;
}

function renderPlatformOptions() {
  const existing = new Set(getProfilesForBrand().map((profile) => profile.platformKey));
  els.newPlatformKey.innerHTML = platformCatalog
    .filter((platform) => !existing.has(platform.key))
    .map((platform) => `<option value="${platform.key}">${escapeHtml(platform.name)} - ${platform.priority}</option>`)
    .join("");
}

function renderRestreamOptions() {
  els.restreamPlatform.innerHTML = restreamPlatforms
    .map((platform) => `<option value="${platform.id}">${escapeHtml(platform.name)}</option>`)
    .join("");
}

function renderProfileList() {
  const search = els.platformSearch.value.trim().toLowerCase();
  const filter = els.stateFilter.value || "all";
  const profiles = getProfilesForBrand().filter((profile) => {
    const platform = getPlatform(profile.platformKey);
    const readiness = getProfileReadiness(profile);
    const matchesFilter = filter === "all" || readiness === filter;
    const text = [platform?.name, profile.targetHandle, profile.actualHandle, profile.displayName]
      .join(" ")
      .toLowerCase();
    return matchesFilter && text.includes(search);
  });

  els.profileList.innerHTML = "";
  profiles.forEach((profile) => {
    const platform = getPlatform(profile.platformKey);
    const readiness = getProfileReadiness(profile);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `profile-button ${profile.id === selectedProfileId ? "active" : ""}`;
    button.dataset.profileId = profile.id;
    button.innerHTML = `
      <strong>${escapeHtml(platform?.name || profile.platformKey)}</strong>
      <small>${escapeHtml(profile.actualHandle || profile.targetHandle || "No handle recorded")}</small>
      <span class="button-foot">
        <span class="status-pill ${statusClass(readiness)}">${formatLabel(readiness)}</span>
        <small>${getProfileCompletion(profile)}%</small>
      </span>
    `;
    els.profileList.appendChild(button);
  });
}

function renderProfile() {
  const profile = getSelectedProfile();
  const brand = getBrand();
  els.profileEmptyState.hidden = Boolean(profile);
  els.profileView.hidden = !profile;
  if (!profile) return;

  const platform = getPlatform(profile.platformKey);
  const readiness = getProfileReadiness(profile);
  els.brandKicker.textContent = brand?.name || "Brand";
  els.platformTitle.textContent = platform?.name || profile.platformKey;
  els.profileMeta.innerHTML = `
    <span class="meta-pill">${escapeHtml(platform?.priority || "P")}</span>
    <span class="meta-pill">Owner: ${escapeHtml(brand?.owner || "Unassigned")}</span>
    <span class="meta-pill">${escapeHtml(brand?.domain || "No domain")}</span>
    <span class="status-pill ${statusClass(readiness)}">${formatLabel(readiness)}</span>
  `;
  els.profileScore.textContent = `${getProfileCompletion(profile)}%`;

  els.ownershipStateLabel.textContent = formatLabel(profile.ownershipState);
  els.securityStateLabel.textContent = formatLabel(profile.securityState);
  els.profileStateLabel.textContent = formatLabel(profile.profileState);
  els.connectorStateLabel.textContent = formatLabel(profile.connectorState);

  els.targetHandle.value = profile.targetHandle || "";
  els.actualHandle.value = profile.actualHandle || "";
  els.profileUrl.value = profile.profileUrl || "";
  els.displayName.value = profile.displayName || "";
  els.bio.value = profile.bio || "";
  els.websiteUrl.value = profile.websiteUrl || "";
  els.businessStatus.value = profile.businessAccountStatus || "unknown";
  els.profileImage.value = profile.profileImageAsset || "";
  els.bannerAsset.value = profile.bannerAsset || "";
  els.profileNotes.value = profile.notes || "";
  renderPlatformGuidance(profile);

  renderMediaAssets(profile);
  renderEvidence(profile);
  renderRequiredFields(profile);
  renderRestreamCandidate(profile);
  renderAudit(profile);
}

function renderPlatformGuidance(profile) {
  const platform = getPlatform(profile.platformKey);
  const fallback = {
    profile:
      "Complete the handle, public URL, display name, profile copy, website, and public-facing brand fields required for this platform before readiness review.",
    media:
      "Attach the profile image, banner or cover image where applicable, proof screenshots, and any profile-level image or video assets. Include dimensions in each asset description.",
    evidence:
      "Capture non-secret proof of ownership, security, profile review, connector readiness, and approval before moving this platform toward publishing or streaming.",
    restream:
      platform?.restreamNote || "Only prepare a Restream candidate after ownership, security, profile fields, and human approval are complete."
  };
  const guidance = platformGuidance[profile.platformKey] || fallback;
  els.profileGuidance.textContent = guidance.profile || fallback.profile;
  els.mediaGuidance.textContent = guidance.media || fallback.media;
  els.evidenceGuidance.textContent = guidance.evidence || fallback.evidence;
  els.restreamGuidance.textContent = guidance.restream || fallback.restream;
}

function renderMediaAssets(profile) {
  els.mediaAssetList.innerHTML = "";
  if (!profile.mediaAssets.length) {
    els.mediaAssetList.innerHTML = `<p class="empty-note">No media assets recorded. Add profile images, banners, intro videos, screenshots, and other account profile assets here.</p>`;
    return;
  }
  profile.mediaAssets
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((asset) => {
      const card = document.createElement("article");
      card.className = "media-asset-card";
      const preview = asset.previewDataUrl
        ? `<img src="${asset.previewDataUrl}" alt="${escapeHtml(asset.assetName)} preview" />`
        : `<span>${escapeHtml(formatLabel(asset.assetType))}</span>`;
      card.innerHTML = `
        <div class="media-preview">${preview}</div>
        <div class="media-asset-body">
          <header>
            <strong>${escapeHtml(asset.assetName || asset.fileName || "Untitled asset")}</strong>
            <span class="status-pill ${statusClass(asset.approvalState)}">${formatLabel(asset.approvalState)}</span>
          </header>
          <small>${formatLabel(asset.assetType)} - ${escapeHtml(asset.fileName || "No file selected")}</small>
          <p><strong>Description:</strong> ${escapeHtml(buildAssetDescription(asset))}</p>
          ${asset.usageContext ? `<p><strong>Usage:</strong> ${escapeHtml(asset.usageContext)}</p>` : ""}
        </div>
      `;
      els.mediaAssetList.appendChild(card);
    });
}

function buildAssetDescription(asset) {
  const dimensions = getAssetDimensionsLabel(asset);
  const description = asset.description || "No description provided.";
  return `${description} Dimensions: ${dimensions}.`;
}

function getAssetDimensionsLabel(asset) {
  const width = Number(asset.width) || 0;
  const height = Number(asset.height) || 0;
  const duration = Number(asset.durationSeconds) || 0;
  const size = width && height ? `${width} x ${height}px` : "not recorded";
  return duration ? `${size}; duration ${duration.toFixed(1)}s` : size;
}

function renderEvidence(profile) {
  els.evidenceList.innerHTML = "";
  if (!profile.evidence.length) {
    els.evidenceList.innerHTML = `<p class="empty-note">No evidence recorded. Add ownership, security, and profile proof before connector work.</p>`;
    return;
  }
  profile.evidence
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((item) => {
      const card = document.createElement("article");
      card.className = "evidence-card";
      card.innerHTML = `
        <header>
          <strong>${escapeHtml(item.title)}</strong>
          <span class="status-pill ${statusClass(item.status)}">${formatLabel(item.status)}</span>
        </header>
        <small>${formatLabel(item.evidenceType)} - ${new Date(item.createdAt).toLocaleString()}</small>
        <p>${escapeHtml(item.description)}</p>
        ${item.evidenceUrl ? `<a href="${escapeHtml(item.evidenceUrl)}" target="_blank" rel="noreferrer">Open evidence URL</a>` : ""}
      `;
      els.evidenceList.appendChild(card);
    });
}

function renderRequiredFields(profile) {
  const platform = getPlatform(profile.platformKey);
  const required = platform?.required || [];
  const complete = required.filter((field) => isFieldComplete(profile, field)).length;
  els.requiredSummary.className = `status-pill ${complete === required.length ? "approved" : "needs-approval"}`;
  els.requiredSummary.textContent = `${complete}/${required.length}`;
  els.requiredFields.innerHTML = required
    .map((field) => {
      const done = isFieldComplete(profile, field);
      return `
        <div class="required-item ${done ? "done" : "missing"}">
          <strong>${formatLabel(field)}</strong>
          <span class="status-pill ${done ? "approved" : "needs-approval"}">${done ? "Done" : "Missing"}</span>
        </div>
      `;
    })
    .join("");
}

function renderRestreamCandidate(profile) {
  const candidate = profile.restreamCandidate || {};
  els.restreamPlatform.value = candidate.platformId || "";
  els.restreamDisplayName.value = candidate.displayName || "";
  els.streamUrlRef.value = candidate.streamUrlSecretRef || "";
  els.streamKeyRef.value = candidate.streamKeySecretRef || "";
  els.rtmpUserRef.value = candidate.rtmpUsernameSecretRef || "";
  els.rtmpPasswordRef.value = candidate.rtmpPasswordSecretRef || "";
  els.instagramUsername.value = candidate.instagramUsername || "";
  els.restreamApprovalState.value = candidate.approvalState || "draft";
  els.restreamStatus.className = `status-pill ${statusClass(candidate.approvalState || "draft")}`;
  els.restreamStatus.textContent = formatLabel(candidate.approvalState || "draft");
  els.payloadPreview.textContent = JSON.stringify(buildRestreamPayload(profile), null, 2);
}

function buildRestreamPayload(profile) {
  const candidate = profile.restreamCandidate || {};
  const payload = {
    endpoint: "POST https://api.restream.io/v2/user/channels",
    requiredScope: "channels.write",
    approvalState: candidate.approvalState || "draft",
    body: {
      platformId: Number(candidate.platformId) || null,
      displayName: candidate.displayName || `${getBrand(profile.brandId)?.name || "Brand"} - ${getPlatform(profile.platformKey)?.name || "Channel"}`
    },
    secretRefs: {}
  };
  if (candidate.streamUrlSecretRef) payload.secretRefs.streamUrl = candidate.streamUrlSecretRef;
  if (candidate.streamKeySecretRef) payload.secretRefs.streamKey = candidate.streamKeySecretRef;
  if (candidate.rtmpUsernameSecretRef) payload.secretRefs.rtmpUsername = candidate.rtmpUsernameSecretRef;
  if (candidate.rtmpPasswordSecretRef) payload.secretRefs.rtmpPassword = candidate.rtmpPasswordSecretRef;
  if (candidate.instagramUsername) payload.body.instagramUsername = candidate.instagramUsername;
  return payload;
}

function renderAudit(profile) {
  const events = state.auditEvents
    .filter((event) => event.profileId === profile.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  els.auditCount.className = `status-pill ${events.length ? "in-progress" : "not-started"}`;
  els.auditCount.textContent = `${events.length} ${events.length === 1 ? "event" : "events"}`;
  els.auditTimeline.innerHTML = "";
  if (!events.length) {
    els.auditTimeline.innerHTML = `<p class="empty-note">No audit events yet.</p>`;
    return;
  }
  events.forEach((event) => {
    const card = document.createElement("article");
    card.className = "audit-card";
    card.innerHTML = `
      <header>
        <strong>${escapeHtml(event.action)}</strong>
        <small>${new Date(event.createdAt).toLocaleString()}</small>
      </header>
      <p>${escapeHtml(event.detail)}</p>
    `;
    els.auditTimeline.appendChild(card);
  });
}

function updateProfileFromForm() {
  const profile = getSelectedProfile();
  if (!profile) return;
  profile.targetHandle = els.targetHandle.value.trim();
  profile.actualHandle = els.actualHandle.value.trim();
  profile.profileUrl = els.profileUrl.value.trim();
  profile.displayName = els.displayName.value.trim();
  profile.bio = els.bio.value.trim();
  profile.websiteUrl = els.websiteUrl.value.trim();
  profile.businessAccountStatus = els.businessStatus.value;
  profile.profileImageAsset = els.profileImage.value.trim();
  profile.bannerAsset = els.bannerAsset.value.trim();
  profile.notes = els.profileNotes.value.trim();
  profile.updatedAt = new Date().toISOString();
  autoAdvanceProfile(profile);
}

function autoAdvanceProfile(profile) {
  const platform = getPlatform(profile.platformKey);
  const required = platform?.required || [];
  const allRequiredComplete = required.every((field) => isFieldComplete(profile, field));
  const acceptedTypes = new Set(
    profile.evidence.filter((item) => item.status === "accepted").map((item) => item.evidenceType)
  );
  if (acceptedTypes.has("ownership")) profile.ownershipState = "ownership_claimed";
  if (acceptedTypes.has("security")) profile.securityState = "verified";
  if (allRequiredComplete && acceptedTypes.has("profile")) profile.profileState = "ready";
  if (
    profile.ownershipState === "ownership_claimed" &&
    profile.securityState === "verified" &&
    profile.profileState === "ready" &&
    profile.connectorState === "none"
  ) {
    profile.connectorState = "candidate";
  }
}

function updateRestreamFromForm() {
  const profile = getSelectedProfile();
  if (!profile) return;
  profile.restreamCandidate = {
    ...profile.restreamCandidate,
    platformId: Number(els.restreamPlatform.value) || "",
    displayName: els.restreamDisplayName.value.trim(),
    streamUrlSecretRef: els.streamUrlRef.value.trim(),
    streamKeySecretRef: els.streamKeyRef.value.trim(),
    rtmpUsernameSecretRef: els.rtmpUserRef.value.trim(),
    rtmpPasswordSecretRef: els.rtmpPasswordRef.value.trim(),
    instagramUsername: els.instagramUsername.value.trim(),
    approvalState: els.restreamApprovalState.value
  };
  profile.updatedAt = new Date().toISOString();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function readMediaDimensions(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ width: "", height: "", durationSeconds: "" });
      return;
    }
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) {
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: image.naturalWidth, height: image.naturalHeight, durationSeconds: "" });
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: "", height: "", durationSeconds: "" });
      };
      image.src = url;
      return;
    }
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          durationSeconds: Number.isFinite(video.duration) ? Number(video.duration.toFixed(1)) : ""
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: "", height: "", durationSeconds: "" });
      };
      video.src = url;
      return;
    }
    URL.revokeObjectURL(url);
    resolve({ width: "", height: "", durationSeconds: "" });
  });
}

function addAudit(profile, action, detail) {
  state.auditEvents.push({
    id: makeId(),
    profileId: profile.id,
    brandId: profile.brandId,
    action,
    detail,
    createdAt: new Date().toISOString()
  });
}

function cycleState(profile, key) {
  const values = stateCycle[key];
  if (!values) return;
  const currentIndex = values.indexOf(profile[key]);
  profile[key] = values[(currentIndex + 1) % values.length];
  profile.updatedAt = new Date().toISOString();
  addAudit(profile, "State changed", `${formatLabel(key)} set to ${formatLabel(profile[key])}.`);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2400);
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function bindEvents() {
  els.brandSelect.addEventListener("change", () => {
    selectedBrandId = els.brandSelect.value;
    selectedProfileId = getProfilesForBrand(selectedBrandId)[0]?.id || "";
    render();
  });

  els.platformSearch.addEventListener("input", renderProfileList);
  els.stateFilter.addEventListener("change", renderProfileList);

  els.profileList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-profile-id]");
    if (!button) return;
    selectedProfileId = button.dataset.profileId;
    render();
  });

  document.querySelectorAll("[data-action='add-platform'], #addPlatform").forEach((button) => {
    button.addEventListener("click", () => {
      renderPlatformOptions();
      els.platformDialog.showModal();
    });
  });

  els.platformForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      els.platformDialog.close();
      return;
    }
    const formData = new FormData(els.platformForm);
    const profile = createProfile(selectedBrandId, formData.get("platformKey"));
    profile.targetHandle = String(formData.get("targetHandle") || "").trim();
    state.profiles.push(profile);
    selectedProfileId = profile.id;
    addAudit(profile, "Platform added", `${getPlatform(profile.platformKey)?.name || "Platform"} added to brand.`);
    els.platformForm.reset();
    els.platformDialog.close();
    render();
  });

  document.querySelectorAll(".state-card").forEach((button) => {
    button.addEventListener("click", () => {
      const profile = getSelectedProfile();
      if (!profile) return;
      cycleState(profile, button.dataset.stateKey);
      render();
    });
  });

  document.querySelector("#saveProfile").addEventListener("click", () => {
    const profile = getSelectedProfile();
    if (!profile) return;
    updateProfileFromForm();
    addAudit(profile, "Profile saved", "Profile fields and readiness were updated.");
    render();
    showToast("Profile saved");
  });

  document.querySelector("#markBlocked").addEventListener("click", () => {
    const profile = getSelectedProfile();
    if (!profile) return;
    profile.blocked = !profile.blocked;
    addAudit(profile, profile.blocked ? "Profile blocked" : "Block cleared", "Operator toggled block state.");
    render();
  });

  document.querySelector("#addEvidence").addEventListener("click", () => {
    els.evidenceDialog.showModal();
  });

  document.querySelector("#addMediaAsset").addEventListener("click", () => {
    els.mediaForm.reset();
    els.mediaDialog.showModal();
  });

  els.mediaFile.addEventListener("change", async () => {
    const file = els.mediaFile.files?.[0];
    const dimensions = await readMediaDimensions(file);
    if (dimensions.width) els.assetWidth.value = dimensions.width;
    if (dimensions.height) els.assetHeight.value = dimensions.height;
    if (dimensions.durationSeconds) els.assetDuration.value = dimensions.durationSeconds;
    const nameInput = els.mediaForm.elements.assetName;
    if (file && !nameInput.value.trim()) nameInput.value = file.name.replace(/\.[^.]+$/, "");
  });

  els.mediaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      els.mediaDialog.close();
      return;
    }
    const profile = getSelectedProfile();
    if (!profile) return;
    const formData = new FormData(els.mediaForm);
    const file = els.mediaFile.files?.[0];
    const previewDataUrl = await readFileAsDataUrl(file);
    const asset = {
      id: makeId(),
      assetType: formData.get("assetType"),
      assetName: String(formData.get("assetName") || file?.name || "Untitled asset").trim(),
      fileName: file?.name || "",
      mimeType: file?.type || "",
      fileSizeBytes: file?.size || 0,
      width: Number(formData.get("assetWidth")) || "",
      height: Number(formData.get("assetHeight")) || "",
      durationSeconds: Number(formData.get("assetDuration")) || "",
      usageContext: String(formData.get("usageContext") || "").trim(),
      description: String(formData.get("assetDescription") || "").trim(),
      approvalState: formData.get("approvalState"),
      previewDataUrl,
      createdAt: new Date().toISOString()
    };
    profile.mediaAssets.push(asset);
    if (asset.assetType === "avatar") profile.profileImageAsset = asset.assetName;
    if (asset.assetType === "banner") profile.bannerAsset = asset.assetName;
    addAudit(profile, "Media asset added", `${formatLabel(asset.assetType)} saved with dimensions: ${getAssetDimensionsLabel(asset)}.`);
    els.mediaForm.reset();
    els.mediaDialog.close();
    render();
  });

  els.evidenceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      els.evidenceDialog.close();
      return;
    }
    const profile = getSelectedProfile();
    if (!profile) return;
    const formData = new FormData(els.evidenceForm);
    profile.evidence.push({
      id: makeId(),
      evidenceType: formData.get("evidenceType"),
      title: String(formData.get("title") || "").trim(),
      evidenceUrl: String(formData.get("evidenceUrl") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      status: formData.get("status"),
      createdAt: new Date().toISOString()
    });
    autoAdvanceProfile(profile);
    addAudit(profile, "Evidence added", `${formatLabel(formData.get("evidenceType"))} evidence recorded.`);
    els.evidenceForm.reset();
    els.evidenceDialog.close();
    render();
  });

  document.querySelector("#saveRestreamCandidate").addEventListener("click", () => {
    const profile = getSelectedProfile();
    if (!profile) return;
    updateRestreamFromForm();
    addAudit(profile, "Restream candidate saved", "Restream channel candidate fields were saved with secret references only.");
    render();
    showToast("Restream candidate saved");
  });

  document.querySelector("#approveRestreamCandidate").addEventListener("click", () => {
    const profile = getSelectedProfile();
    if (!profile) return;
    updateRestreamFromForm();
    profile.restreamCandidate.approvalState = "approved";
    profile.connectorState = "candidate";
    addAudit(profile, "Restream candidate approved", "Human approval recorded. API write still requires backend submission.");
    render();
    showToast("Candidate approved");
  });

  document.querySelector("#copyRestreamPayload").addEventListener("click", async () => {
    const profile = getSelectedProfile();
    if (!profile) return;
    await copyText(JSON.stringify(buildRestreamPayload(profile), null, 2));
    showToast("Payload copied");
  });

  document.querySelector("#exportProfiles").addEventListener("click", () => {
    downloadJson("social-profile-by-brand-export.json", state);
  });

  document.querySelector("#resetProfiles").addEventListener("click", () => {
    state = createSeedState();
    selectedBrandId = state.selectedBrandId;
    selectedProfileId = state.selectedProfileId;
    render();
    showToast("Demo reset");
  });
}

bindEvents();
render();
