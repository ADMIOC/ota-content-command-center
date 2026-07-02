const notionDataSources = {
  brands: process.env.NOTION_SOCIAL_BRANDS_DATA_SOURCE_ID || "",
  profiles: process.env.NOTION_SOCIAL_PROFILES_DATA_SOURCE_ID || "",
  assets: process.env.NOTION_SOCIAL_MEDIA_ASSETS_DATA_SOURCE_ID || "",
  evidence: process.env.NOTION_SOCIAL_EVIDENCE_DATA_SOURCE_ID || "",
  restreamCandidates: process.env.NOTION_RESTREAM_CANDIDATES_DATA_SOURCE_ID || "",
  auditEvents: process.env.NOTION_SOCIAL_AUDIT_EVENTS_DATA_SOURCE_ID || ""
};

export function notionStatus() {
  const configuredSources = Object.entries(notionDataSources)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);
  return {
    enabled: Boolean(process.env.NOTION_TOKEN),
    tokenConfigured: Boolean(process.env.NOTION_TOKEN),
    configuredSources,
    missingSources: Object.entries(notionDataSources)
      .filter(([, value]) => !value)
      .map(([key]) => key),
    mode: process.env.NOTION_TOKEN ? "ready_for_live_sync" : "local_file_backed"
  };
}

export function buildNotionSyncPlan(state) {
  return {
    status: notionStatus(),
    counts: {
      brands: state.brands.length,
      profiles: state.profiles.length,
      assets: state.profiles.reduce((count, profile) => count + (profile.mediaAssets || []).length, 0),
      evidence: state.profiles.reduce((count, profile) => count + (profile.evidence || []).length, 0),
      restreamCandidates: state.profiles.filter((profile) => profile.restreamCandidate).length,
      auditEvents: state.auditEvents.length
    },
    order: [
      "brands",
      "profiles",
      "assets",
      "evidence",
      "restreamCandidates",
      "auditEvents"
    ],
    writeMode: process.env.NOTION_TOKEN ? "configured_not_executed" : "blocked_missing_notion_token"
  };
}
