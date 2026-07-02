export const platformCatalog = [
  { key: "youtube", name: "YouTube", priority: "P0", required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "bannerAsset"] },
  { key: "instagram", name: "Instagram", priority: "P0", required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "businessAccountStatus"], restreamPlatformId: 73 },
  { key: "facebook_page", name: "Facebook Page", priority: "P0", required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "bannerAsset", "businessAccountStatus"] },
  { key: "linkedin", name: "LinkedIn", priority: "P0", required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "websiteUrl"] },
  { key: "tiktok", name: "TikTok", priority: "P0", required: ["actualHandle", "profileUrl", "displayName", "bio", "profileImageAsset", "businessAccountStatus"] },
  { key: "custom_rtmp", name: "Custom RTMP", priority: "P1", required: ["displayName", "websiteUrl"], restreamPlatformId: 29 }
];

export const restreamPlatforms = [
  { id: "", name: "No Restream manual channel" },
  { id: 29, name: "Custom RTMP", needsUrl: true, needsKey: false },
  { id: 37, name: "Facebook Group", needsUrl: false, needsKey: true },
  { id: 72, name: "Telegram", needsUrl: true, needsKey: true },
  { id: 73, name: "Instagram", needsUrl: false, needsKey: true },
  { id: 79, name: "Substack", needsUrl: false, needsKey: true }
];

export const platformGuidance = {
  youtube: {
    profile: "For YouTube, complete the confirmed channel handle, public channel URL, display name, channel bio, website link, avatar, and banner.",
    media: "Add the channel avatar, banner art, thumbnail or cover templates, and any intro or channel-trailer video. Record dimensions for every asset.",
    evidence: "Record internal confirmation that the YouTube channel exists, belongs to our brand, has the right operator access, and is approved for profile and connector work.",
    restream: "YouTube is handled as a verified Restream-connected destination, not a manual Add Channel platform. Leave the manual platform unset unless Restream requires a Custom RTMP fallback, and store OAuth client credentials plus the write-scoped refresh token in the Credential Vault."
  },
  instagram: {
    profile: "For Instagram, complete the actual handle, profile URL, display name, bio, website link, avatar, and professional or business account status.",
    media: "Add the avatar, story highlight covers, pinned-post media, launch reels, and brand-safe cover images.",
    evidence: "Record internal confirmation that the Instagram account exists, belongs to our brand, has the right Meta/operator access, and is approved for profile and connector work.",
    restream: "Restream documents a manual Instagram channel path using platform ID 73 with a stream key and optional Instagram username."
  },
  facebook_page: {
    profile: "For Facebook Page, complete the page URL, page handle, display name, about copy, website link, logo, cover image, and Meta business ownership status.",
    media: "Add the page profile image, cover image, launch graphics, post templates, pinned video or intro media, and Meta-safe brand screenshots.",
    evidence: "Record internal confirmation that the Facebook Page exists, belongs to our brand, has the right Meta/admin access, and is approved for profile and publishing work.",
    restream: "Use a connected Restream Facebook destination where possible. For manual channel work, store only secret references and keep Meta approval proof in evidence."
  },
  linkedin: {
    profile: "For LinkedIn, complete the company or showcase page URL, public handle, display name, about copy, website link, logo, and page admin proof.",
    media: "Add the company logo, cover/banner image, post image templates, launch video cover, and screenshots showing page identity and admin access.",
    evidence: "Record internal confirmation that the LinkedIn page exists, aligns with our brand/domain, has the right admin access, and is approved for profile and publishing work.",
    restream: "Prefer direct Restream LinkedIn authorization where available. Keep any manual connector notes as references only and do not store credentials in the browser."
  },
  tiktok: {
    profile: "For TikTok, complete the handle, profile URL, display name, bio, website or link-in-bio status, avatar, and business account status.",
    media: "Add the avatar, launch video covers, pinned video candidates, short-form intro clips, and brand-safe vertical media references.",
    evidence: "Record internal confirmation that the TikTok account exists, belongs to our brand, has the right operator access, and is approved for profile and streaming-readiness review.",
    restream: "Use Restream only after the account is verified as eligible for the intended streaming workflow. Store stream details as secret references only."
  },
  custom_rtmp: {
    profile: "For Custom RTMP, record the destination name, destination owner, website or destination URL, and operational notes.",
    media: "Attach destination logos, event graphics, thumbnails, proof screenshots, and destination-specific video requirements.",
    evidence: "Record internal confirmation that this destination is authorized for our workflow, has a known operator owner, and is approved for non-destructive connector testing.",
    restream: "Restream platform ID 29 requires a stream URL and may use a stream key plus optional RTMP auth. Store credential values as secret references only."
  }
};

export function makeId(prefix = "id") {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2)}`;
}

export function getPlatform(platformKey) {
  return platformCatalog.find((platform) => platform.key === platformKey);
}

function createProfile(brandId, platformKey) {
  const platform = getPlatform(platformKey);
  return {
    id: makeId("profile"),
    brandId,
    platformKey,
    priority: platform?.priority || "P1",
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
    blockedReason: "",
    nextAction: "",
    readyForConnector: false,
    readyForPublishing: false,
    sourceSystem: "notion",
    syncStatus: "not_synced",
    notes: "",
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
      readyForSubmit: false,
      blockedReason: "",
      nextAction: ""
    }
  };
}

export function createSeedState() {
  const brands = [
    { id: "brand-otap", name: "Own The Algo Podcast", slug: "otap", domain: "https://podcast.ownthealgo.com", owner: "Jey", status: "active", priority: "P0" },
    { id: "brand-crshcs", name: "CRS Healthcare Solutions", slug: "crshcs", domain: "https://crshcs.com", owner: "Jeff", status: "draft", priority: "P0" },
    { id: "brand-wyr", name: "WYR Detail", slug: "wyr", domain: "https://wyrdetail.com", owner: "Mike", status: "draft", priority: "P1" },
    { id: "brand-thevfo", name: "The VFO", slug: "thevfo", domain: "https://thevfo.com", owner: "Mike", status: "draft", priority: "P1" }
  ];
  const profiles = brands.flatMap((brand) => platformCatalog.map((platform) => createProfile(brand.id, platform.key)));
  const otapYoutube = profiles.find((profile) => profile.brandId === "brand-otap" && profile.platformKey === "youtube");
  Object.assign(otapYoutube, {
    targetHandle: "@ownthealgo",
    actualHandle: "@ownthealgo",
    profileUrl: "https://www.youtube.com/@ownthealgo",
    displayName: "Agentic Jey",
    bio: "Own The Algo helps underrepresented entrepreneurs become AI-native and agentic. We turn high-signal AI, automation, and founder/operator insights into practical playbooks, workflows, and validation lessons for builders, creators, operators, and investors navigating the agentic economy.",
    websiteUrl: "https://podcast.ownthealgo.com",
    profileImageAsset: "OTAP YouTube avatar candidate - Hero Closeup Bright",
    bannerAsset: "OTAP YouTube banner candidate - DataBurst Gabriel Centered",
    businessAccountStatus: "not_required",
    ownershipState: "ownership_claimed",
    securityState: "incomplete",
    profileState: "needs_review",
    nextAction: "Approve avatar/banner, resolve display-name decision, and confirm MFA/recovery proof.",
    notes: "Sourced from OTAP Show Bible, Brand Instructions, local Brand Kit, and user-supplied YouTube proof screenshots.",
    mediaAssets: [
      {
        id: "asset-otap-youtube-avatar",
        assetType: "avatar",
        assetName: "OTAP YouTube avatar candidate - Hero Closeup Bright",
        fileName: "OTA_Square_Hero_Closeup_Bright_2048x2048.png",
        mimeType: "image/png",
        width: 2048,
        height: 2048,
        usageContext: "Candidate YouTube profile picture / avatar for @ownthealgo.",
        description: "Local Brand Kit source. YouTube profile picture minimum is 98 x 98 pixels and 4MB or less.",
        approvalState: "needs_review",
        createdAt: "2026-06-30T20:55:00.000Z"
      },
      {
        id: "asset-otap-youtube-banner",
        assetType: "banner",
        assetName: "OTAP YouTube banner candidate - DataBurst Gabriel Centered",
        fileName: "OTA_UltraWide_DataBurst_Gabriel_Centered_2752x1536.png",
        mimeType: "image/png",
        width: 2752,
        height: 1536,
        usageContext: "Candidate YouTube channel banner for @ownthealgo.",
        description: "Local Brand Kit source. YouTube banner minimum is 2048 x 1152 pixels and 6MB or less; safe-area review still required.",
        approvalState: "needs_review",
        createdAt: "2026-06-30T20:56:00.000Z"
      }
    ],
    evidence: [
      {
        id: "evidence-otap-youtube-ownership",
        evidenceType: "ownership",
        title: "Logged-in YouTube channel access proof",
        description: "Screenshots supplied on 2026-06-30 show @ownthealgo with Customize channel, Manage videos, and YouTube Studio customization access.",
        status: "accepted",
        createdAt: "2026-06-30T20:20:00.000Z"
      },
      {
        id: "evidence-otap-youtube-profile",
        evidenceType: "profile",
        title: "Profile copy and media candidates sourced",
        evidenceUrl: "https://app.notion.com/p/351a90a45ed780e6b41dd079631dc920",
        description: "YouTube About copy was drafted from OTAP source material, and avatar/banner candidates were sourced from the local Own The Algo Brand Kit.",
        status: "accepted",
        createdAt: "2026-06-30T20:58:00.000Z"
      },
      {
        id: "evidence-otap-youtube-name-decision",
        evidenceType: "approval",
        title: "Brand-name alignment decision required",
        description: "The active YouTube display name is Agentic Jey while the operating profile is Own The Algo Podcast.",
        status: "pending",
        createdAt: "2026-06-30T20:59:00.000Z"
      }
    ]
  });
  return {
    brands,
    profiles,
    auditEvents: [
      {
        id: "audit-phase-2-seed",
        eventType: "system",
        action: "Phase 6 seed loaded",
        detail: "React app/backend seed state initialized from the Phase 1 control-plane shape, Phase 3 API boundary, Phase 4 media-storage layer, Phase 5 secret-reference flow, and Phase 6 Restream adapter.",
        status: "recorded",
        sourceSystem: "backend_api",
        createdAt: new Date().toISOString()
      }
    ],
    selectedBrandId: "brand-otap",
    selectedProfileId: otapYoutube.id
  };
}
