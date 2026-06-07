const storageKey = "ota-content-command-center-v1";
const githubRepoFullName = "ADMIOC/ota-content-command-center";

const stageTemplates = [
  {
    name: "Campaign Setup",
    shortName: "Setup",
    toolName: "Creative Direction",
    filterName: "01 Setup - Campaign Setup",
    checklist: [
      "Active brand and campaign name confirmed",
      "Agentic creative direction generated and reviewed",
      "Creator edits or augmentations captured",
      "Platform target selected",
      "Output quantity and owner assigned",
      "Compliance guardrails reviewed when applicable"
    ]
  },
  {
    name: "Scene Planning",
    shortName: "Scenes",
    toolName: "Scripts, prompts, and guardrails",
    filterName: "02 Scenes - Scene Planning",
    checklist: [
      "Scene list drafted",
      "Each scene has a Higgsfield prompt",
      "Claims, medical references, and brand language reviewed",
      "Scene voiceover script drafted",
      "Thumbnail direction captured",
      "Revision path assigned"
    ]
  },
  {
    name: "Script + Audio Production",
    shortName: "Audio",
    toolName: "ElevenLabs",
    filterName: "03 Audio - ElevenLabs",
    checklist: [
      "ElevenLabs account confirmed",
      "Voice profile selected",
      "Scene voiceover script approved",
      "Audio tracks generated",
      "Audio track URLs ready for Codex + Remotion"
    ]
  },
  {
    name: "Timed Video Assembly",
    shortName: "Assembly Input",
    toolName: "Codex + Remotion",
    filterName: "04 Assembly Input - Codex + Remotion",
    checklist: [
      "ElevenLabs script and audio tracks imported",
      "Remotion composition generated",
      "Timing and captions aligned to audio",
      "Preview export reviewed",
      "Remotion output ready for Higgsfield Studio"
    ]
  },
  {
    name: "Visual Generation",
    shortName: "Visuals",
    toolName: "Higgsfield Studio",
    filterName: "05 Visuals - Higgsfield Studio",
    checklist: [
      "Approved Codex + Remotion output imported",
      "Generation files created",
      "Raw outputs collected",
      "Failed generations marked",
      "Approved clips moved to assembly queue"
    ]
  },
  {
    name: "Quality Review",
    shortName: "QA",
    toolName: "Human QA and compliance",
    filterName: "06 QA - Quality Review",
    checklist: [
      "Reviewer assigned",
      "Visual quality approved",
      "Voiceover quality approved",
      "Compliance check completed",
      "Caption accuracy reviewed",
      "Final approval recorded"
    ]
  },
  {
    name: "Final Assembly",
    shortName: "Final Edit",
    toolName: "Render, audio, and thumbnail",
    filterName: "07 Final Edit - Assembly",
    checklist: [
      "Final edit assembled",
      "Audio levels checked",
      "Thumbnail exported",
      "Final video rendered",
      "Export naming matches storage path"
    ]
  },
  {
    name: "Publishing Package",
    shortName: "Package",
    toolName: "Caption, hashtags, and platform notes",
    filterName: "08 Package - Publishing Prep",
    checklist: [
      "Caption written",
      "Hashtags approved",
      "Platform notes added",
      "Publishing package reviewed"
    ]
  },
  {
    name: "Asset Storage",
    shortName: "Storage",
    toolName: "Bunny CDN",
    filterName: "09 Storage - Bunny CDN",
    checklist: [
      "Bunny folder path confirmed",
      "Final video URL added",
      "Thumbnail URL added",
      "Scene files URL added",
      "Approval document URL added"
    ]
  },
  {
    name: "Social Publishing",
    shortName: "Publish",
    toolName: "Blotato",
    filterName: "10 Publish - Blotato",
    checklist: [
      "Approved media URL present",
      "Caption package ready",
      "Publishing status set",
      "Storage manifest copied to workflow docs"
    ]
  }
];

const approvalLabels = [
  "Human QA approved",
  "Compliance guardrails satisfied",
  "ElevenLabs audio approved",
  "Codex + Remotion output approved",
  "Thumbnail reads as a reduced full infographic cover",
  "Bunny storage links complete",
  "Publishing package ready for Blotato"
];

const defaultBrandProfiles = [
  {
    id: "brand-own-the-algo",
    name: "Own The Algo",
    regulated: false,
    voice:
      "Direct, useful, operator-led, and confident without hype. The brand should feel like a builder showing the actual system.",
    audience:
      "Founders, creators, operators, and business owners who want practical AI systems that create leverage.",
    offers:
      "AI implementation, agentic workflows, content systems, consulting, templates, and education.",
    perspective:
      "founder-led operator POV, sharp screen-life pacing, direct-to-camera confidence, and visible proof of repeatable AI systems",
    guardrails: "",
    platforms: "TikTok, Instagram Reels, YouTube Shorts, LinkedIn"
  },
  {
    id: "brand-own-the-algo-podcast",
    name: "Own The Algo Podcast",
    regulated: false,
    voice:
      "Conversational, curious, energetic, and intelligent. It should sound like smart builders talking through real moves.",
    audience:
      "Entrepreneurs, creators, investors, and AI-curious operators who want signal, strategy, and tactical ideas.",
    offers:
      "Podcast audience growth, sponsorships, community, consulting, content flywheel, and AI-native brand authority.",
    perspective:
      "podcast host energy, conversational authority, studio-to-field transitions, and cinematic closeups that make expertise feel immediate",
    guardrails: "",
    platforms: "TikTok, Instagram Reels, YouTube Shorts, LinkedIn"
  },
  {
    id: "brand-crs",
    name: "CRS",
    regulated: true,
    voice:
      "Calm, precise, operational, and trust-first. Avoid hype and keep AI positioned as workflow support.",
    audience:
      "Hospital leaders, revenue-cycle teams, eligibility teams, and healthcare operators responsible for Medicaid eligibility workflows.",
    offers:
      "Medicaid eligibility intelligence, operational workflow support, revenue-cycle enablement, and hospital-facing services.",
    perspective:
      "hospital operations documentary tone, calm revenue-cycle urgency, anonymous workflow visuals, and grounded eligibility-intelligence storytelling",
    guardrails:
      "No patient-identifying information, patient names, visible medical records, or PHI.\nAvoid guaranteed eligibility, coverage, reimbursement, recovery, or clinical outcome claims.\nDescribe AI as workflow support and eligibility intelligence, not autonomous medical or coverage decision-making.\nUse anonymous operational visuals and route final copy through human compliance review before publishing.",
    platforms: "LinkedIn, YouTube Shorts, Instagram Reels"
  },
  {
    id: "brand-the-vfo",
    name: "The VFO",
    regulated: true,
    voice:
      "Executive, measured, fiduciary-minded, and precise. The brand should feel like strategic finance leadership, not a hype machine.",
    audience:
      "Founders, family offices, operators, and business owners evaluating finance, valuation, exit, and growth decisions.",
    offers:
      "Virtual family office strategy, financial operating models, advisory, acquisition readiness, and executive finance support.",
    perspective:
      "executive finance war-room perspective, fiduciary clarity, measured confidence, and clean boardroom visuals that avoid exaggerated claims",
    guardrails:
      "No guaranteed investment, tax, legal, valuation, return, exit, or financing outcomes.\nAvoid personalized financial advice unless the asset is reviewed and approved for that use.\nUse measured fiduciary language and make uncertainty, context, and review boundaries clear.\nRoute final copy through human compliance review before publishing.",
    platforms: "LinkedIn, YouTube Shorts"
  }
];

const reviewSections = [
  { id: "campaign-overview", name: "Campaign Overview" },
  { id: "workflow-stage", name: "Workflow Stage" },
  { id: "scene-queue", name: "Scene Queue" },
  { id: "elevenlabs-audio", name: "ElevenLabs Audio" },
  { id: "remotion-pass", name: "Codex + Remotion" },
  { id: "approval-gate", name: "Approval Gate" },
  { id: "bunny-storage", name: "Bunny Storage" },
  { id: "publishing-package", name: "Publishing Package" },
  { id: "publishing-calendar", name: "Publishing Calendar" }
];

const reviewSectionTargets = {
  "campaign-overview": "#campaign-overview",
  "workflow-stage": "#workflow-stage-panel",
  "scene-queue": "#scene-queue-section",
  "elevenlabs-audio": "#elevenlabs-audio-section",
  "remotion-pass": "#remotion-pass-section",
  "approval-gate": "#approval-gate-section",
  "bunny-storage": "#bunny-storage-section",
  "publishing-package": "#publishing-package-section",
  "publishing-calendar": "#publishing-calendar-section"
};

const commandSections = [
  { label: "Overview", target: "#campaign-overview", cue: "brand, owner, readiness" },
  { label: "Brand", target: "#active-brand-profile", cue: "voice and guardrails" },
  { label: "Direction", target: "#creative-direction", cue: "active creative version" },
  { label: "Preview", target: "#creator-preview-studio", cue: "script and media view" },
  { label: "Ideas", target: "#enhancement-idea-section", cue: "enhancement intake" },
  { label: "Team", target: "#team-collaboration-section", cue: "threads and mentions" },
  { label: "Current Stage", target: "#workflow-stage-panel", cue: "checklist and owner" },
  { label: "Scenes", target: "#scene-queue-section", cue: "scripts and prompts" },
  { label: "Approvals", target: "#approval-gate-section", cue: "human gate" },
  { label: "Production", target: "#elevenlabs-audio-section", cue: "audio and video" },
  { label: "Storage", target: "#bunny-storage-section", cue: "asset source of truth" },
  { label: "Publishing", target: "#publishing-package-section", cue: "caption package" },
  { label: "Calendar", target: "#publishing-calendar-section", cue: "schedule slots" },
  { label: "Agent Ops", target: "#agent-operations-layer", cue: "live execution" }
];

const defaultCampaigns = [
  {
    brand: "CRS",
    name: "Medicaid Eligibility Insights Launch",
    platform: "Multi-platform",
    quantity: 6,
    dueDate: "2026-06-14",
    owner: "Jeff",
    creativeDirection:
      "Short-form videos that show CRS as a practical eligibility intelligence partner for hospitals, with each output focused on one operational pain point.",
    guardrails:
      "No patient-specific claims. Avoid guaranteed recovery language. Keep AI claims tied to workflow support and eligibility intelligence.",
    scenes: [
      {
        id: makeId(),
        title: "Waiting Room Backlog",
        script:
          "Every unresolved eligibility file is not just paperwork. It is time, revenue, and patient access waiting for a clearer next step.",
        prompt:
          "Hospital eligibility team facing a visible backlog of unresolved Medicaid verification work, realistic operational tone, clean documentary lighting.",
        compliance:
          "Keep the scene anonymous and avoid showing patient names or records.",
        status: "approved"
      },
      {
        id: makeId(),
        title: "CRS Workflow Reveal",
        script:
          "CRS helps eligibility teams turn scattered Medicaid work into a guided operational workflow, so staff can see what needs attention next.",
        prompt:
          "A calm operations dashboard organizes eligibility work into clear next actions, with staff moving from confusion to confident triage.",
        compliance:
          "Represent workflow assistance without implying fully autonomous coverage decisions.",
        status: "in-progress"
      }
    ]
  }
];

let state;
state = loadState();
let selectedCampaignId = state.selectedCampaignId || state.campaigns[0]?.id || "";
let selectedStageIndex = state.selectedStageIndex || 0;
let selectedReviewSectionId = state.selectedReviewSectionId || reviewSections[0].id;
let creativeDirectionTouched = false;
let brandCoPilotReply = "";

const elements = {
  metricActive: document.querySelector("#metricActive"),
  metricApproved: document.querySelector("#metricApproved"),
  metricBlocked: document.querySelector("#metricBlocked"),
  campaignSearch: document.querySelector("#campaignSearch"),
  stageFilter: document.querySelector("#stageFilter"),
  campaignList: document.querySelector("#campaignList"),
  campaignView: document.querySelector("#campaignView"),
  emptyState: document.querySelector("#emptyState"),
  campaignBrand: document.querySelector("#campaignBrand"),
  campaignTitle: document.querySelector("#campaignTitle"),
  campaignMeta: document.querySelector("#campaignMeta"),
  readinessBreakdown: document.querySelector("#readinessBreakdown"),
  nextActionCue: document.querySelector("#nextActionCue"),
  commandSectionNav: document.querySelector("#commandSectionNav"),
  previewReadinessStatus: document.querySelector("#previewReadinessStatus"),
  previewSignalStrip: document.querySelector("#previewSignalStrip"),
  scriptPreviewStatus: document.querySelector("#scriptPreviewStatus"),
  scriptPreview: document.querySelector("#scriptPreview"),
  mediaPreview: document.querySelector("#mediaPreview"),
  platformPreview: document.querySelector("#platformPreview"),
  brandProfileSummary: document.querySelector("#brandProfileSummary"),
  creativeDirectionVersions: document.querySelector("#creativeDirectionVersions"),
  regenerateCampaignDirection: document.querySelector("#regenerateCampaignDirection"),
  editActiveBrand: document.querySelector("#editActiveBrand"),
  readinessScore: document.querySelector("#readinessScore"),
  stageTabs: Array.from(document.querySelectorAll(".stage-tab")),
  stageKicker: document.querySelector("#stageKicker"),
  stageTitle: document.querySelector("#stageTitle"),
  stageStatus: document.querySelector("#stageStatus"),
  stageChecklist: document.querySelector("#stageChecklist"),
  stageOwner: document.querySelector("#stageOwner"),
  stageDue: document.querySelector("#stageDue"),
  stageNotes: document.querySelector("#stageNotes"),
  coPilotKicker: document.querySelector("#coPilotKicker"),
  coPilotTitle: document.querySelector("#coPilotTitle"),
  coPilotStatus: document.querySelector("#coPilotStatus"),
  coPilotSummary: document.querySelector("#coPilotSummary"),
  coPilotSuggestions: document.querySelector("#coPilotSuggestions"),
  coPilotActions: document.querySelector("#coPilotActions"),
  sceneList: document.querySelector("#sceneList"),
  approvalStatus: document.querySelector("#approvalStatus"),
  approvalChecks: document.querySelector("#approvalChecks"),
  bunnyFolder: document.querySelector("#bunnyFolder"),
  assetVideo: document.querySelector("#assetVideo"),
  assetThumbnail: document.querySelector("#assetThumbnail"),
  assetVoiceover: document.querySelector("#assetVoiceover"),
  assetVoiceScript: document.querySelector("#assetVoiceScript"),
  assetRemotionOutput: document.querySelector("#assetRemotionOutput"),
  assetCaptionDoc: document.querySelector("#assetCaptionDoc"),
  assetScenes: document.querySelector("#assetScenes"),
  assetApprovalDoc: document.querySelector("#assetApprovalDoc"),
  elevenLabsAccount: document.querySelector("#elevenLabsAccount"),
  elevenLabsStatus: document.querySelector("#elevenLabsStatus"),
  elevenLabsVoice: document.querySelector("#elevenLabsVoice"),
  elevenLabsScriptUrl: document.querySelector("#elevenLabsScriptUrl"),
  elevenLabsAudioUrl: document.querySelector("#elevenLabsAudioUrl"),
  elevenLabsNotes: document.querySelector("#elevenLabsNotes"),
  remotionSourceAudio: document.querySelector("#remotionSourceAudio"),
  remotionOutputUrl: document.querySelector("#remotionOutputUrl"),
  remotionNotes: document.querySelector("#remotionNotes"),
  captionText: document.querySelector("#captionText"),
  hashtags: document.querySelector("#hashtags"),
  platformNotes: document.querySelector("#platformNotes"),
  scheduleStatusSummary: document.querySelector("#scheduleStatusSummary"),
  schedulePlatform: document.querySelector("#schedulePlatform"),
  scheduleDate: document.querySelector("#scheduleDate"),
  scheduleTime: document.querySelector("#scheduleTime"),
  scheduleStatus: document.querySelector("#scheduleStatus"),
  scheduleNotes: document.querySelector("#scheduleNotes"),
  publishingCalendarGrid: document.querySelector("#publishingCalendarGrid"),
  publishingScheduleList: document.querySelector("#publishingScheduleList"),
  campaignDialog: document.querySelector("#campaignDialog"),
  campaignForm: document.querySelector("#campaignForm"),
  campaignDialogCoPilot: document.querySelector("#campaignDialogCoPilot"),
  campaignBrandSelect: document.querySelector("#campaignBrandSelect"),
  customBrandField: document.querySelector("#customBrandField"),
  customBrandName: document.querySelector("#customBrandName"),
  generateCreativeDirection: document.querySelector("#generateCreativeDirection"),
  brandDialog: document.querySelector("#brandDialog"),
  brandDialogCoPilot: document.querySelector("#brandDialogCoPilot"),
  brandProfileForm: document.querySelector("#brandProfileForm"),
  brandProfileSelect: document.querySelector("#brandProfileSelect"),
  newBrandProfile: document.querySelector("#newBrandProfile"),
  sceneDialog: document.querySelector("#sceneDialog"),
  sceneDialogCoPilot: document.querySelector("#sceneDialogCoPilot"),
  sceneForm: document.querySelector("#sceneForm"),
  reviewPanel: document.querySelector("#enhancement-idea-section"),
  reviewCount: document.querySelector("#reviewCount"),
  reviewSectionButtons: document.querySelector("#reviewSectionButtons"),
  reviewerName: document.querySelector("#reviewerName"),
  reviewPriority: document.querySelector("#reviewPriority"),
  reviewComment: document.querySelector("#reviewComment"),
  reviewRequestList: document.querySelector("#reviewRequestList"),
  openEnhancementIdeas: document.querySelector("#openEnhancementIdeas"),
  collaborationNotificationSummary: document.querySelector("#collaborationNotificationSummary"),
  collaborationMetrics: document.querySelector("#collaborationMetrics"),
  collaboratorName: document.querySelector("#collaboratorName"),
  collaboratorRole: document.querySelector("#collaboratorRole"),
  collaborationSection: document.querySelector("#collaborationSection"),
  collaborationStatus: document.querySelector("#collaborationStatus"),
  collaborationMentions: document.querySelector("#collaborationMentions"),
  collaborationNote: document.querySelector("#collaborationNote"),
  collaborationThreadList: document.querySelector("#collaborationThreadList"),
  agentActivityLog: document.querySelector("#agentActivityLog"),
  agentOpsMetrics: document.querySelector("#agentOpsMetrics"),
  agentTaskQueue: document.querySelector("#agentTaskQueue"),
  performanceIntelligence: document.querySelector("#performanceIntelligence"),
  repurposeCandidates: document.querySelector("#repurposeCandidates"),
  restreamOps: document.querySelector("#restreamOps"),
  descriptOps: document.querySelector("#descriptOps"),
  agentApprovalConsole: document.querySelector("#agentApprovalConsole"),
  viralLiftScore: document.querySelector("#viralLiftScore"),
  copyActivityLog: document.querySelector("#copyActivityLog"),
  toast: document.querySelector("#toast")
};

function makeId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createStage(template, owner = "", dueDate = "") {
  return {
    status: "not-started",
    owner,
    dueDate,
    notes: "",
    checks: template.checklist.map((label) => ({ label, done: false }))
  };
}

function cloneDefaultBrandProfiles() {
  return defaultBrandProfiles.map((profile) => ({ ...profile }));
}

function getBrandProfiles() {
  return state?.brandProfiles?.length ? state.brandProfiles : defaultBrandProfiles;
}

function getBrandProfile(brandName) {
  const normalized = String(brandName || "").trim().toLowerCase();
  return getBrandProfiles().find((brand) => brand.name.toLowerCase() === normalized);
}

function getBrandProfileById(id) {
  return getBrandProfiles().find((brand) => brand.id === id);
}

function getCampaignFormField(name) {
  return elements.campaignForm.elements[name];
}

function getBrandFormField(name) {
  return elements.brandProfileForm.elements.namedItem(name);
}

function getCampaignFormBrandName() {
  const selectedBrand = elements.campaignBrandSelect.value;
  if (selectedBrand === "__other__") return elements.customBrandName.value.trim();
  return selectedBrand;
}

function isRegulatedBrand(brandName) {
  return Boolean(getBrandProfile(brandName)?.regulated);
}

function buildCreativeDirectionDraft(formInput = {}) {
  const brand = formInput.brand || getCampaignFormBrandName() || "the selected brand";
  const profile = getBrandProfile(brand);
  const campaignName = formInput.name || getCampaignFormField("name")?.value.trim() || "the campaign";
  const platform = formInput.platform || getCampaignFormField("platform")?.value || "the target platform";
  const quantity = formInput.quantity || getCampaignFormField("quantity")?.value || "the planned";
  const perspective =
    profile?.perspective ||
    "brand-native point of view, cinematic texture, clear emotional stakes, and repeatable visual language";
  const voice = profile?.voice ? ` Voice should feel ${profile.voice.toLowerCase()}` : "";
  const audience = profile?.audience ? ` Primary audience: ${profile.audience}` : "";
  const offers = profile?.offers ? ` Monetization context: ${profile.offers}` : "";

  return [
    `Create ${quantity} ${platform} outputs for ${brand} around "${campaignName}" with ${perspective}.`,
    `The storytelling should define the voiceover rhythm first, then shape scene composition, camera movement, lighting, pacing, captions, and transitions around that audio-led spine.${voice}${audience}${offers}`,
    "Each scene should make the viewer feel the before-and-after shift: the tension the audience recognizes, the insight that reframes it, and the confident action the brand makes possible."
  ].join("\n\n");
}

function buildComplianceGuardrails(brandName) {
  return getBrandProfile(brandName)?.guardrails || "";
}

function renderBrandOptions() {
  elements.campaignBrandSelect.innerHTML = getBrandProfiles()
    .map((brand) => `<option value="${escapeHtml(brand.name)}">${escapeHtml(brand.name)}</option>`)
    .concat('<option value="__other__">Other</option>')
    .join("");
}

function renderBrandManagerOptions(selectedId = elements.brandProfileSelect?.value) {
  if (!elements.brandProfileSelect) return;
  elements.brandProfileSelect.innerHTML = getBrandProfiles()
    .map((brand) => `<option value="${escapeHtml(brand.id)}">${escapeHtml(brand.name)}</option>`)
    .join("");
  if (selectedId && getBrandProfileById(selectedId)) {
    elements.brandProfileSelect.value = selectedId;
  }
}

function loadBrandProfileForm(profileId = elements.brandProfileSelect.value) {
  const profile = getBrandProfileById(profileId) || getBrandProfiles()[0];
  if (!profile) return;
  elements.brandProfileSelect.value = profile.id;
  getBrandFormField("name").value = profile.name || "";
  getBrandFormField("regulated").checked = Boolean(profile.regulated);
  getBrandFormField("voice").value = profile.voice || "";
  getBrandFormField("audience").value = profile.audience || "";
  getBrandFormField("offers").value = profile.offers || "";
  getBrandFormField("perspective").value = profile.perspective || "";
  getBrandFormField("guardrails").value = profile.guardrails || "";
  getBrandFormField("platforms").value = profile.platforms || "";
}

function openBrandDialog(profileName = "") {
  renderBrandManagerOptions();
  const profile = profileName ? getBrandProfile(profileName) : getBrandProfiles()[0];
  loadBrandProfileForm(profile?.id);
  if (!getBrandFormField("name").value && getBrandProfiles()[0]) {
    loadBrandProfileForm(getBrandProfiles()[0].id);
  }
  renderBrandDialogCoPilot();
  elements.brandDialog.showModal();
}

function renderDialogCoPilot(container, guidance) {
  if (!container) return;
  container.innerHTML = `
    <div class="dialog-copilot-heading">
      <div>
        <p class="eyebrow">Official OTA Brand Build Co-Pilot</p>
        <h3>${escapeHtml(guidance.title)}</h3>
      </div>
      <span class="status-pill in-progress">Live Guide</span>
    </div>
    <p>${escapeHtml(guidance.summary)}</p>
    <div class="copilot-list">
      ${guidance.suggestions.map((item) => `<article class="copilot-suggestion">${escapeHtml(item)}</article>`).join("")}
    </div>
    <div class="copilot-actions">
      ${guidance.actions
        .map((action) => `<button class="mini-button" type="button" data-dialog-copilot-action="${action.id}">${escapeHtml(action.label)}</button>`)
        .join("")}
    </div>
  `;
}

function getMissingCampaignFields() {
  return [
    ["Campaign name", getCampaignFormField("name")?.value.trim()],
    ["Due date", getCampaignFormField("dueDate")?.value],
    ["Owner", getCampaignFormField("owner")?.value.trim()],
    ["Creative direction", getCampaignFormField("creativeDirection")?.value.trim()]
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);
}

function renderCampaignDialogCoPilot() {
  const brandName = getCampaignFormBrandName() || "the selected brand";
  const profile = getBrandProfile(brandName);
  const campaignName = getCampaignFormField("name")?.value.trim() || "this campaign";
  const missing = getMissingCampaignFields();
  renderDialogCoPilot(elements.campaignDialogCoPilot, {
    title: "Launch Workstream Guidance",
    summary: `I am guiding this workstream around ${brandName}. The setup should lock brand, story direction, owner, due date, and compliance posture before scenes begin.`,
    suggestions: [
      profile
        ? `Brand voice: ${profile.voice || profile.perspective}`
        : "This is a new brand. I will create a reusable brand shell when you launch.",
      missing.length ? `Still needed: ${missing.join(", ")}.` : "Required setup fields are ready.",
      profile?.regulated
        ? "This is a regulated brand. Guardrails must stay active before scripts, audio, and publishing."
        : "This brand is not marked regulated, so guardrails stay inactive unless the brand profile changes.",
      `Creative direction should make "${campaignName}" feel cinematic, specific, and useful before any production handoff.`
    ],
    actions: [
      { id: "campaign-refresh-direction", label: "Refresh Direction" },
      { id: "campaign-apply-guardrails", label: "Apply Guardrails" }
    ]
  });
}

function renderSceneDialogCoPilot() {
  const campaign = getSelectedCampaign();
  const profile = campaign ? getBrandProfile(campaign.brand) : null;
  renderDialogCoPilot(elements.sceneDialogCoPilot, {
    title: "Scene Build Guidance",
    summary: campaign
      ? `I am helping convert ${campaign.brand}'s creative direction into a script-first scene for ElevenLabs, Remotion, and Higgsfield.`
      : "I am helping create a script-first scene that can travel through the OTA production chain.",
    suggestions: [
      "Write the video script first. The prompt should serve the voiceover, not the other way around.",
      `Visual language should follow: ${profile?.perspective || "the active brand cinematic perspective"}.`,
      profile?.regulated
        ? "Include a compliance note before generation because this brand is regulated."
        : "Keep the compliance note focused on brand fit or leave it empty if no risk applies.",
      "A strong scene has tension, insight, and one clear action or visual payoff."
    ],
    actions: [{ id: "scene-draft-fields", label: "Draft Scene Fields" }]
  });
}

function renderBrandDialogCoPilot() {
  const name = getBrandFormField("name")?.value.trim() || "this brand";
  const regulated = Boolean(getBrandFormField("regulated")?.checked);
  const voiceValue = getBrandFormField("voice")?.value.trim() || "";
  const audienceValue = getBrandFormField("audience")?.value.trim() || "";
  const offersValue = getBrandFormField("offers")?.value.trim() || "";
  const perspectiveValue = getBrandFormField("perspective")?.value.trim() || "";
  const existingPrompt = document.querySelector("#brandCoPilotPrompt")?.value || "";
  const missingFields = [
    ["brand voice", voiceValue],
    ["audience", audienceValue],
    ["offers / monetization", offersValue],
    ["cinematic perspective", perspectiveValue]
  ]
    .filter(([, value]) => !value || containsHelpIntent(value))
    .map(([label]) => label);
  const activeFieldPrompt = getBrandActiveFieldPrompt();
  renderDialogCoPilot(elements.brandDialogCoPilot, {
    title: "Brand Profile Guidance",
    summary: `I am guiding ${name}'s brand profile so every campaign, script, scene, caption, and monetization path inherits the same operating DNA.`,
    suggestions: [
      activeFieldPrompt,
      "Brand voice should describe how the brand sounds under pressure, not just adjectives.",
      "Audience should name the buyer or viewer and the moment they care most.",
      "Offers / Monetization should connect content to revenue, leads, sponsorship, services, or authority.",
      missingFields.length ? `I can draft or tighten: ${missingFields.join(", ")}.` : "The core brand fields are filled and ready to refine.",
      regulated
        ? "Because this is regulated, compliance guardrails should be explicit and conservative."
        : "If this becomes regulated later, turn on the regulated flag before launching campaigns."
    ].filter(Boolean),
    actions: [
      { id: "brand-draft-voice", label: "Draft Brand Voice" },
      { id: "brand-draft-profile", label: "Draft Missing Profile" }
    ]
  });
  elements.brandDialogCoPilot.insertAdjacentHTML(
    "beforeend",
    `
      <div class="dialog-copilot-interaction" aria-label="Brand co-pilot interaction">
        <div class="dialog-copilot-reply" id="brandCoPilotReply">${escapeHtml(
          brandCoPilotReply ||
            "Tell me what you need help with, or type directly into a field and I will guide the next draft."
        )}</div>
        <div class="dialog-copilot-prompt">
          <input id="brandCoPilotPrompt" type="text" value="${escapeHtml(existingPrompt)}" placeholder="Ask: Help me create the brand voice" autocomplete="off" />
          <button class="mini-button" type="button" data-dialog-copilot-action="brand-answer-prompt">Ask Co-Pilot</button>
        </div>
      </div>
    `
  );
}

function containsHelpIntent(value) {
  return /\b(help|create|draft|write|suggest|build|generate|make)\b/i.test(value || "");
}

function getBrandActiveFieldPrompt() {
  if (containsHelpIntent(getBrandFormField("voice")?.value)) {
    return "I see the brand voice field is asking for help. Use Draft Brand Voice and I will replace that request with an on-brand voice draft.";
  }
  if (containsHelpIntent(getBrandFormField("audience")?.value)) {
    return "I see the audience field is asking for help. Use Draft Missing Profile and I will shape the audience around the brand context.";
  }
  if (containsHelpIntent(getBrandFormField("offers")?.value)) {
    return "I see the offers field is asking for help. Use Draft Missing Profile and I will connect content to monetization paths.";
  }
  if (containsHelpIntent(getBrandFormField("perspective")?.value)) {
    return "I see the cinematic perspective field is asking for help. Use Draft Missing Profile and I will create a repeatable storytelling lens.";
  }
  return "";
}

function buildBrandVoiceDraft(name, regulated) {
  return regulated
    ? `${name} should sound measured, precise, trust-first, and calm under scrutiny. The voice should explain risk clearly, avoid overpromising, and make complex decisions feel easier to review.`
    : `${name} should sound clear, confident, useful, and operator-led. The voice should feel like a smart builder showing the audience what works, why it matters, and what to do next.`;
}

function buildBrandAudienceDraft(name) {
  return `${name}'s audience is made of creators, operators, founders, buyers, and decision-makers who need a clearer path from attention to action. They care most when the content names a real bottleneck and shows a practical next move.`;
}

function buildBrandOffersDraft(name) {
  return `${name} can monetize through content-led authority, lead capture, productized services, consulting, templates, education, partnerships, sponsorships, and repeatable offers tied to measurable audience demand.`;
}

function buildBrandPerspectiveDraft(regulated) {
  return regulated
    ? "clean executive documentary perspective, grounded visuals, measured pacing, proof-led storytelling, and conservative composition choices"
    : "brand-native point of view, cinematic texture, clear emotional stakes, energetic pacing, and repeatable visual language";
}

function syncCampaignSetupFields({ forceCreative = false } = {}) {
  const selectedBrand = elements.campaignBrandSelect.value;
  const isOtherBrand = selectedBrand === "__other__";
  elements.customBrandField.hidden = !isOtherBrand;
  elements.customBrandName.required = isOtherBrand;

  const brandName = getCampaignFormBrandName();
  const creativeDirection = getCampaignFormField("creativeDirection");
  if (creativeDirection && (forceCreative || !creativeDirectionTouched || !creativeDirection.value.trim())) {
    creativeDirection.value = buildCreativeDirectionDraft({ brand: brandName });
    creativeDirectionTouched = false;
  }

  const guardrails = getCampaignFormField("guardrails");
  const regulated = isRegulatedBrand(brandName);
  if (!guardrails) {
    renderCampaignDialogCoPilot();
    return;
  }

  guardrails.disabled = !regulated;
  guardrails.required = regulated;
  if (!regulated) {
    guardrails.value = "";
    guardrails.placeholder = "Only enabled for regulated brands.";
    guardrails.dataset.generated = "";
    renderCampaignDialogCoPilot();
    return;
  }

  guardrails.placeholder = "";
  if (!guardrails.value.trim() || guardrails.dataset.generated === "true") {
    guardrails.value = buildComplianceGuardrails(brandName);
    guardrails.dataset.generated = "true";
  }
  renderCampaignDialogCoPilot();
}

function resetCampaignSetupState() {
  creativeDirectionTouched = false;
  elements.campaignForm.reset();
  elements.campaignBrandSelect.value = "Own The Algo Podcast";
  elements.customBrandName.value = "";
  syncCampaignSetupFields({ forceCreative: true });
}

function openCampaignDialog() {
  resetCampaignSetupState();
  renderCampaignDialogCoPilot();
  elements.campaignDialog.showModal();
}

function addAgentActivity(type, message, campaignId = selectedCampaignId) {
  state.agentActivity = state.agentActivity || [];
  state.agentActivity.push({
    id: makeId(),
    type,
    message,
    campaignId: campaignId || "",
    createdAt: new Date().toISOString()
  });
  if (state.agentActivity.length > 100) {
    state.agentActivity = state.agentActivity.slice(-100);
  }
}

function createCreativeDirectionVersion(value, source = "Agentic draft") {
  return {
    id: makeId(),
    value,
    source,
    createdAt: new Date().toISOString()
  };
}

function createAgentTask(agent, action, status = "pending") {
  return {
    id: makeId(),
    agent,
    action,
    status,
    createdAt: new Date().toISOString()
  };
}

function createAgentOps(seed = {}) {
  const campaignName = seed.name || "this campaign";
  return {
    tasks: [
      createAgentTask("Research + Signal Agent", `Monitor public response and trend signals for ${campaignName}.`, "running"),
      createAgentTask("Performance Intelligence Agent", "Score viral lift, repurpose value, and audience demand.", "pending"),
      createAgentTask("Repurposing Agent", "Prepare follow-up hooks, clips, captions, and campaign derivatives.", "pending")
    ],
    performanceSignals: [
      {
        id: makeId(),
        source: "Baseline",
        signal: "Awaiting publish/live response data.",
        score: 28,
        createdAt: new Date().toISOString()
      }
    ],
    repurposeCandidates: [],
    restream: {
      status: "not-scheduled",
      broadcastTitle: `${campaignName} Live Signal Session`,
      clipCandidates: [],
      liveNotes: "Restream will capture live engagement, chat themes, and clip-worthy moments after approval."
    },
    descript: {
      status: "not-started",
      projectRef: "",
      enhancedAssetUrl: "",
      editPlan: "Use Descript for transcript-aware edits, audio cleanup, stitched segments, avatar polish, and rapid derivative exports."
    },
    approvals: [
      {
        id: makeId(),
        label: "Approve agent publishing or live broadcast actions",
        status: "required",
        createdAt: new Date().toISOString()
      },
      {
        id: makeId(),
        label: "Approve regulated claims before clipping or repurposing",
        status: "required",
        createdAt: new Date().toISOString()
      }
    ]
  };
}

function createCampaign(input) {
  const safeBrand = (input.brand || "").trim() || "Brand";
  const safeName = input.name.trim() || "Untitled Campaign";
  const creativeDirection = input.creativeDirection.trim();
  const brandProfile = getBrandProfile(safeBrand);
  return {
    id: makeId(),
    brand: safeBrand,
    brandProfileId: brandProfile?.id || "",
    name: safeName,
    platform: input.platform,
    quantity: Number(input.quantity) || 1,
    dueDate: input.dueDate,
    owner: input.owner.trim(),
    creativeDirection,
    creativeDirectionVersions: [createCreativeDirectionVersion(creativeDirection, "Launch workstream draft")],
    guardrails: (input.guardrails || "").trim(),
    createdAt: new Date().toISOString(),
    stages: stageTemplates.map((template, index) =>
      createStage(template, input.owner.trim(), index < 2 ? input.dueDate : "")
    ),
    scenes: [],
    approvals: approvalLabels.map((label) => ({ label, done: false })),
    assets: {
      bunnyFolder: buildBunnyFolder(safeBrand, safeName),
      video: "",
      thumbnail: "",
      voiceover: "",
      voiceScript: "",
      remotionOutput: "",
      captionDoc: "",
      scenes: "",
      approvalDoc: ""
    },
    elevenLabs: {
      accountLogin: "agentic@ownthealgo.com",
      apiStatus: "active",
      voiceProfile: "",
      scriptUrl: "",
      voiceoverUrl: "",
      notes: ""
    },
    remotion: {
      sourceAudioUrl: "",
      outputUrl: "",
      compositionNotes: ""
    },
    publishing: {
      caption: "",
      hashtags: "",
      platformNotes: "",
      status: "not-ready",
      schedule: []
    },
    agentOps: createAgentOps({ ...input, name: safeName, brand: safeBrand }),
    collaborationThreads: [],
    reviewRequests: []
  };
}

function normalizeCampaign(seed) {
  const campaign = createCampaign(seed);
  campaign.id = makeId();
  campaign.scenes = seed.scenes || [];
  campaign.stages[0].status = "approved";
  campaign.stages[0].checks.forEach((check) => {
    check.done = true;
  });
  campaign.stages[1].status = "in-progress";
  campaign.stages[1].checks[0].done = true;
  campaign.stages[1].checks[1].done = true;
  campaign.publishing.caption =
    "Hospitals do not need another eligibility spreadsheet. CRS helps teams move Medicaid eligibility work into a clearer operational workflow.";
  campaign.publishing.hashtags =
    "#MedicaidEligibility #HospitalOperations #RevenueCycle #HealthcareAI";
  campaign.publishing.platformNotes =
    "Use CRS-approved thumbnail. Confirm no patient-identifying information appears in the final render or voiceover.";
  campaign.publishing.schedule = createSuggestedPublishingSchedule(campaign);
  campaign.collaborationThreads = [
    createCollaborationThread({
      sectionId: "scene-queue",
      author: "Myah",
      role: "Reviewer",
      mentions: "@Jeff",
      status: "open",
      note: "Confirm the CRS scene scripts keep the operational urgency without implying guaranteed eligibility outcomes."
    }),
    createCollaborationThread({
      sectionId: "publishing-calendar",
      author: "Jey",
      role: "Publisher",
      mentions: "@Jeff @Myah",
      status: "waiting",
      note: "Calendar slots are drafted. Hold Blotato scheduling until final media and compliance approval are attached."
    })
  ];
  campaign.elevenLabs.voiceProfile = "OTA narrator voice";
  campaign.elevenLabs.scriptUrl = campaign.assets.voiceScript;
  campaign.elevenLabs.voiceoverUrl = campaign.assets.voiceover;
  campaign.elevenLabs.notes =
    "Use ElevenLabs for narration after scene scripts and compliance guardrails are locked. Codex + Remotion ingests the audio tracks before Higgsfield Studio.";
  campaign.remotion.sourceAudioUrl = campaign.elevenLabs.voiceoverUrl;
  campaign.remotion.outputUrl = campaign.assets.remotionOutput;
  campaign.remotion.compositionNotes =
    "Codex + Remotion combines the approved script/audio track with timing, captions, and a preview export for Higgsfield Studio.";
  return campaign;
}

function loadState() {
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.campaigns)) {
        return normalizeState(parsed);
      }
    } catch (error) {
      console.warn("Could not read stored workspace", error);
    }
  }

  return normalizeState({
    brandProfiles: cloneDefaultBrandProfiles(),
    campaigns: defaultCampaigns.map(normalizeCampaign),
    selectedCampaignId: "",
    selectedStageIndex: 0,
    selectedReviewSectionId: reviewSections[0].id,
    reviewRequests: [],
    agentActivity: [
      {
        id: makeId(),
        type: "System",
        message: "Demo workspace initialized with default brand profiles and production workflow.",
        createdAt: new Date().toISOString()
      }
    ]
  });
}

function normalizeState(workspace) {
  workspace.brandProfiles = normalizeBrandProfiles(workspace.brandProfiles);
  workspace.agentActivity = Array.isArray(workspace.agentActivity) ? workspace.agentActivity : [];
  workspace.reviewRequests = workspace.reviewRequests || [];
  workspace.selectedReviewSectionId = workspace.selectedReviewSectionId || reviewSections[0].id;
  workspace.campaigns.forEach((campaign) => {
    normalizeCampaignShape(campaign);
  });
  return workspace;
}

function normalizeBrandProfiles(profiles) {
  const defaults = cloneDefaultBrandProfiles();
  const byName = new Map(defaults.map((profile) => [profile.name.toLowerCase(), profile]));
  (profiles || []).forEach((profile) => {
    if (!profile?.name) return;
    byName.set(profile.name.toLowerCase(), {
      id: profile.id || makeId(),
      name: profile.name,
      regulated: Boolean(profile.regulated),
      voice: profile.voice || "",
      audience: profile.audience || "",
      offers: profile.offers || "",
      perspective: profile.perspective || "",
      guardrails: profile.guardrails || "",
      platforms: profile.platforms || ""
    });
  });
  return Array.from(byName.values());
}

function normalizeCampaignShape(campaign) {
  campaign.reviewRequests = campaign.reviewRequests || [];
  campaign.collaborationThreads = Array.isArray(campaign.collaborationThreads)
    ? campaign.collaborationThreads.map((thread) =>
        createCollaborationThread({
          id: thread.id,
          sectionId: thread.sectionId,
          author: thread.author,
          role: thread.role,
          mentions: thread.mentions,
          status: thread.status,
          note: thread.note,
          createdAt: thread.createdAt,
          resolvedAt: thread.resolvedAt
        })
      )
    : [];
  campaign.brandProfileId = campaign.brandProfileId || getBrandProfile(campaign.brand)?.id || "";
  campaign.creativeDirectionVersions = Array.isArray(campaign.creativeDirectionVersions)
    ? campaign.creativeDirectionVersions
    : [];
  if (!campaign.creativeDirectionVersions.length && campaign.creativeDirection) {
    campaign.creativeDirectionVersions.push(
      createCreativeDirectionVersion(campaign.creativeDirection, "Migrated creative direction")
    );
  }
  campaign.scenes = (campaign.scenes || []).map((scene) => ({
    ...scene,
    script: scene.script || "",
    voiceoverNotes: scene.voiceoverNotes || ""
  }));
  campaign.stages = migrateStages(campaign.stages || [], campaign);
  campaign.stages = stageTemplates.map((template, index) => {
    const existing = campaign.stages[index] || {};
    return {
      status: existing.status || "not-started",
      owner: existing.owner || campaign.owner || "",
      dueDate: existing.dueDate || "",
      notes: existing.notes || "",
      checks: template.checklist.map((label) => {
        const existingCheck = (existing.checks || []).find((check) => check.label === label);
        return { label, done: Boolean(existingCheck?.done) };
      })
    };
  });
  campaign.assets = {
    bunnyFolder: campaign.assets?.bunnyFolder || buildBunnyFolder(campaign.brand || "Brand", campaign.name || "Campaign"),
    video: campaign.assets?.video || "",
    thumbnail: campaign.assets?.thumbnail || "",
    voiceover: campaign.assets?.voiceover || campaign.elevenLabs?.voiceoverUrl || "",
    voiceScript: campaign.assets?.voiceScript || campaign.elevenLabs?.scriptUrl || "",
    remotionOutput: campaign.assets?.remotionOutput || campaign.remotion?.outputUrl || "",
    captionDoc: campaign.assets?.captionDoc || "",
    scenes: campaign.assets?.scenes || "",
    approvalDoc: campaign.assets?.approvalDoc || ""
  };
  campaign.elevenLabs = {
    accountLogin: campaign.elevenLabs?.accountLogin || "agentic@ownthealgo.com",
    apiStatus: campaign.elevenLabs?.apiStatus || "active",
    voiceProfile: campaign.elevenLabs?.voiceProfile || "",
    scriptUrl: campaign.elevenLabs?.scriptUrl || campaign.assets.voiceScript || "",
    voiceoverUrl: campaign.elevenLabs?.voiceoverUrl || campaign.assets.voiceover || "",
    notes: campaign.elevenLabs?.notes || ""
  };
  campaign.remotion = {
    sourceAudioUrl:
      campaign.remotion?.sourceAudioUrl || campaign.elevenLabs.voiceoverUrl || campaign.assets.voiceover || "",
    outputUrl: campaign.remotion?.outputUrl || campaign.assets.remotionOutput || "",
    compositionNotes: campaign.remotion?.compositionNotes || ""
  };
  campaign.publishing = {
    caption: campaign.publishing?.caption || "",
    hashtags: campaign.publishing?.hashtags || "",
    platformNotes: campaign.publishing?.platformNotes || "",
    status: campaign.publishing?.status || "not-ready",
    schedule: Array.isArray(campaign.publishing?.schedule)
      ? campaign.publishing.schedule.map((slot) => ({
          id: slot.id || makeId(),
          platform: slot.platform || getCampaignPlatforms(campaign)[0] || "Multi-platform",
          date: slot.date || toDateInputValue(getScheduleBaseDate(campaign)),
          time: slot.time || "09:00",
          status: slot.status || "draft",
          notes: slot.notes || ""
        }))
      : []
  };
  const defaultOps = createAgentOps(campaign);
  campaign.agentOps = {
    tasks: Array.isArray(campaign.agentOps?.tasks) ? campaign.agentOps.tasks : defaultOps.tasks,
    performanceSignals: Array.isArray(campaign.agentOps?.performanceSignals)
      ? campaign.agentOps.performanceSignals
      : defaultOps.performanceSignals,
    repurposeCandidates: Array.isArray(campaign.agentOps?.repurposeCandidates)
      ? campaign.agentOps.repurposeCandidates
      : defaultOps.repurposeCandidates,
    restream: {
      ...defaultOps.restream,
      ...(campaign.agentOps?.restream || {})
    },
    descript: {
      ...defaultOps.descript,
      ...(campaign.agentOps?.descript || {})
    },
    approvals: Array.isArray(campaign.agentOps?.approvals) ? campaign.agentOps.approvals : defaultOps.approvals
  };
  campaign.approvals = approvalLabels.map((label) => {
    const existing = (campaign.approvals || []).find((check) => check.label === label);
    return { label, done: Boolean(existing?.done) };
  });
}

function stageHasCheck(stage, text) {
  return (stage?.checks || []).some((check) => check.label === text);
}

function migrateStages(stages, campaign) {
  const migrated = [...stages];
  const owner = campaign.owner || "";
  const dueDate = campaign.dueDate || "";
  const elevenStage = () => createStage(stageTemplates[2], owner, dueDate);
  const remotionStage = () => createStage(stageTemplates[3], owner, dueDate);

  if (migrated.length === stageTemplates.length - 2) {
    migrated.splice(2, 0, elevenStage(), remotionStage());
    return migrated;
  }

  if (migrated.length === stageTemplates.length - 1) {
    if (stageHasCheck(migrated[2], "ElevenLabs account confirmed")) {
      migrated.splice(3, 0, remotionStage());
      return migrated;
    }

    if (stageHasCheck(migrated[3], "ElevenLabs account confirmed")) {
      const [legacyElevenLabs] = migrated.splice(3, 1);
      migrated.splice(2, 0, legacyElevenLabs, remotionStage());
      return migrated;
    }

    migrated.splice(2, 0, elevenStage());
  }

  return migrated;
}

function saveState() {
  state.selectedCampaignId = selectedCampaignId;
  state.selectedStageIndex = selectedStageIndex;
  state.selectedReviewSectionId = selectedReviewSectionId;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function buildBunnyFolder(brand, name) {
  const today = new Date().toISOString().slice(0, 10);
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${brand}-Vid/${brand}/${slug || "campaign"}/${today}`;
}

function getSelectedCampaign() {
  return state.campaigns.find((campaign) => campaign.id === selectedCampaignId);
}

function getReadiness(campaign) {
  const stageChecks = campaign.stages.flatMap((stage) => stage.checks);
  const completedChecks = stageChecks.filter((check) => check.done).length;
  const approvedStages = campaign.stages.filter((stage) => stage.status === "approved").length;
  const approvalChecks = campaign.approvals.filter((check) => check.done).length;
  const total = stageChecks.length + campaign.stages.length + campaign.approvals.length;
  const complete = completedChecks + approvedStages + approvalChecks;
  return Math.round((complete / total) * 100);
}

function getReadinessDetails(campaign) {
  const stageChecks = campaign.stages.flatMap((stage) => stage.checks);
  const completedChecks = stageChecks.filter((check) => check.done).length;
  const approvedStages = campaign.stages.filter((stage) => stage.status === "approved").length;
  const approvedScenes = campaign.scenes.filter((scene) => scene.status === "approved").length;
  const approvalChecks = campaign.approvals.filter((check) => check.done).length;
  return [
    { label: "Stage checks", value: `${completedChecks}/${stageChecks.length}` },
    { label: "Stages approved", value: `${approvedStages}/${campaign.stages.length}` },
    { label: "Scenes approved", value: `${approvedScenes}/${campaign.scenes.length || 0}` },
    { label: "Approval gate", value: `${approvalChecks}/${campaign.approvals.length}` }
  ];
}

function getFirstOpenCheck(stage) {
  return stage.checks.find((check) => !check.done);
}

function getNextActionCue(campaign) {
  const stageIndex = campaign.stages.findIndex((stage) => stage.status !== "approved");
  const index = stageIndex === -1 ? campaign.stages.length - 1 : stageIndex;
  const stage = campaign.stages[index];
  const template = stageTemplates[index];
  const openCheck = getFirstOpenCheck(stage);
  if (stageIndex === -1) {
    return "Next move: archive this campaign package or run Agent Ops to identify repurpose opportunities.";
  }
  return openCheck
    ? `Next move: ${template.name} needs "${openCheck.label}".`
    : `Next move: move ${template.name} to Approved or add the missing owner, date, or note.`;
}

function getSafePreviewUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  try {
    const parsed = new URL(value, window.location.href);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch (error) {
    return "";
  }
}

function getPreviewAssets(campaign) {
  return {
    videoUrl: getSafePreviewUrl(campaign.assets.video || campaign.remotion.outputUrl || campaign.assets.remotionOutput),
    audioUrl: getSafePreviewUrl(campaign.elevenLabs.voiceoverUrl || campaign.assets.voiceover || campaign.remotion.sourceAudioUrl),
    thumbnailUrl: getSafePreviewUrl(campaign.assets.thumbnail),
    scriptUrl: getSafePreviewUrl(campaign.elevenLabs.scriptUrl || campaign.assets.voiceScript),
    captionDocUrl: getSafePreviewUrl(campaign.assets.captionDoc)
  };
}

function getScriptPreviewScenes(campaign) {
  return campaign.scenes.filter((scene) => scene.script || scene.prompt).slice(0, 4);
}

function getPreviewSignals(campaign) {
  const assets = getPreviewAssets(campaign);
  const scriptedScenes = campaign.scenes.filter((scene) => scene.script).length;
  return [
    {
      label: "Script",
      ready: scriptedScenes > 0 || Boolean(assets.scriptUrl),
      detail: scriptedScenes ? `${scriptedScenes} scene scripts` : assets.scriptUrl ? "Script URL linked" : "No script yet"
    },
    {
      label: "Audio",
      ready: Boolean(assets.audioUrl),
      detail: assets.audioUrl ? "Playable/linkable audio" : "ElevenLabs audio pending"
    },
    {
      label: "Video",
      ready: Boolean(assets.videoUrl),
      detail: assets.videoUrl ? "Video reference linked" : "Final or Remotion video pending"
    },
    {
      label: "Thumbnail",
      ready: Boolean(assets.thumbnailUrl),
      detail: assets.thumbnailUrl ? "Thumbnail linked" : "Thumbnail pending"
    },
    {
      label: "Caption",
      ready: Boolean(campaign.publishing.caption),
      detail: campaign.publishing.caption ? "Caption draft visible" : "Caption draft pending"
    }
  ];
}

function getPlatformPreviewProfiles(campaign) {
  const platform = campaign.platform || "Multi-platform";
  const profiles = {
    TikTok: {
      name: "TikTok",
      className: "vertical",
      frame: "9:16 short-form frame",
      note: "Lead with motion, hook text, fast caption beats, and a single visual promise."
    },
    "Instagram Reels": {
      name: "Instagram Reels",
      className: "vertical",
      frame: "9:16 reel frame",
      note: "Keep the first second visually clear and make thumbnail text readable in-feed."
    },
    "YouTube Shorts": {
      name: "YouTube Shorts",
      className: "vertical",
      frame: "9:16 shorts frame",
      note: "Make the voiceover arc complete without relying on a caption-only CTA."
    },
    LinkedIn: {
      name: "LinkedIn",
      className: "feed",
      frame: "Feed video/card frame",
      note: "Open with operational authority, legible captions, and a professional thumbnail."
    }
  };
  if (platform === "Multi-platform") {
    return [profiles.TikTok, profiles["Instagram Reels"], profiles["YouTube Shorts"], profiles.LinkedIn];
  }
  return [profiles[platform] || { name: platform, className: "vertical", frame: "Platform preview", note: "Confirm format, caption, thumbnail, and CTA before publishing." }];
}

function toDateInputValue(date) {
  const local = new Date(date);
  if (Number.isNaN(local.getTime())) return "";
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getCampaignPlatforms(campaign) {
  if (campaign.platform && campaign.platform !== "Multi-platform") return [campaign.platform];
  const profile = getBrandProfile(campaign.brand);
  const fromProfile = (profile?.platforms || "")
    .split(",")
    .map((platform) => platform.trim())
    .filter(Boolean);
  return fromProfile.length ? fromProfile : ["TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn"];
}

function getScheduleBaseDate(campaign) {
  const due = campaign.dueDate ? new Date(`${campaign.dueDate}T09:00:00`) : null;
  if (due && !Number.isNaN(due.getTime())) return due;
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  return today;
}

function createPublishingSlot(campaign, input = {}) {
  const baseDate = input.date || toDateInputValue(getScheduleBaseDate(campaign));
  return {
    id: makeId(),
    platform: input.platform || getCampaignPlatforms(campaign)[0] || "Multi-platform",
    date: baseDate,
    time: input.time || "09:00",
    status: input.status || "draft",
    notes: input.notes || "Ready for Blotato draft once media and caption are approved."
  };
}

function createSuggestedPublishingSchedule(campaign) {
  const platforms = getCampaignPlatforms(campaign);
  const base = getScheduleBaseDate(campaign);
  const times = ["09:00", "12:30", "15:30", "18:00"];
  const count = Math.max(1, Number(campaign.quantity) || platforms.length || 1);
  return Array.from({ length: count }, (_, index) =>
    createPublishingSlot(campaign, {
      platform: platforms[index % platforms.length],
      date: toDateInputValue(addDays(base, Math.floor(index / Math.max(1, platforms.length)))),
      time: times[index % times.length],
      status: index === 0 ? "ready" : "draft",
      notes: index === 0 ? "Primary launch slot. Confirm final media before Blotato scheduling." : "Follow-up slot for platform-native variation."
    })
  );
}

function getScheduleWindow(campaign) {
  const scheduledDates = (campaign.publishing.schedule || [])
    .map((slot) => new Date(`${slot.date || ""}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()));
  const start = scheduledDates.length ? new Date(Math.min(...scheduledDates)) : getScheduleBaseDate(campaign);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function getScheduleStatusClass(status) {
  if (status === "published" || status === "scheduled" || status === "ready") return "approved";
  if (status === "blocked") return "blocked";
  return "not-started";
}

function createCollaborationThread(input = {}) {
  const section = reviewSections.find((item) => item.id === input.sectionId) || reviewSections[0];
  return {
    id: input.id || makeId(),
    sectionId: section.id,
    sectionName: section.name,
    author: input.author || "Creator",
    role: input.role || "Creator",
    mentions: input.mentions || "",
    status: input.status || "open",
    note: input.note || "",
    createdAt: input.createdAt || new Date().toISOString(),
    resolvedAt: input.resolvedAt || ""
  };
}

function getCollaborationMetrics(campaign) {
  const threads = campaign.collaborationThreads || [];
  const open = threads.filter((thread) => thread.status === "open").length;
  const waiting = threads.filter((thread) => thread.status === "waiting").length;
  const resolved = threads.filter((thread) => thread.status === "resolved").length;
  const mentions = threads.filter((thread) => /@\w+/i.test(thread.mentions || thread.note || "")).length;
  return { open, waiting, resolved, mentions, total: threads.length };
}

function getBrandTone(profile) {
  return profile?.voice || profile?.perspective || "brand-native, clear, and useful";
}

function getCoPilotGuidance(campaign) {
  const profile = getBrandProfile(campaign.brand);
  const stage = campaign.stages[selectedStageIndex];
  const template = stageTemplates[selectedStageIndex];
  const openCheck = getFirstOpenCheck(stage);
  const brandTone = getBrandTone(profile);
  const regulatedNote = profile?.regulated
    ? " Keep the compliance guardrails visible before generation or publishing."
    : " Keep the output sharp, useful, and aligned to the brand promise.";
  const sceneCount = campaign.scenes.length;
  const approvedScenes = campaign.scenes.filter((scene) => scene.status === "approved").length;
  const hasScriptedScenes = campaign.scenes.some((scene) => scene.script);

  const base = {
    kicker: `OTA Co-Pilot - Stage ${String(selectedStageIndex + 1).padStart(2, "0")}`,
    title: `${template.shortName} Guidance`,
    status: openCheck ? "Guiding" : "Ready",
    summary: "",
    suggestions: [],
    actions: [
      { id: "complete-next-check", label: "Complete Next Check" },
      { id: "apply-stage-note", label: "Add Stage Note" }
    ]
  };

  if (selectedStageIndex === 0) {
    base.summary = `Lock ${campaign.brand}'s strategic setup before production. The creative direction should sound ${brandTone.toLowerCase()}.${regulatedNote}`;
    base.suggestions = [
      `Use the current brand profile to keep the campaign anchored in ${campaign.brand}'s voice, audience, offer, and cinematic point of view.`,
      openCheck ? `Next setup gap: ${openCheck.label}.` : "Setup is ready to hand into scene planning.",
      "If the campaign feels generic, regenerate creative direction and keep the version that creates the clearest before-and-after story."
    ];
    base.actions.push({ id: "regenerate-direction", label: "Regenerate Direction" });
  } else if (selectedStageIndex === 1) {
    base.summary = `Scene planning should convert the direction into scripted clips. Build scenes around voiceover rhythm first, then Higgsfield visuals.`;
    base.suggestions = [
      sceneCount ? `${sceneCount} scenes exist and ${approvedScenes} are approved.` : "Start with one scripted scene that states the tension, insight, and action.",
      hasScriptedScenes
        ? "At least one scene has script language ready for ElevenLabs."
        : "Add video script text before moving this campaign to ElevenLabs.",
      `Keep each prompt visually consistent with ${profile?.perspective || "the brand cinematic perspective"}.`
    ];
    base.actions.push({ id: "generate-scene-idea", label: "Draft Scene" });
  } else if (selectedStageIndex === 2) {
    base.summary = `ElevenLabs should receive approved scripts, voice profile, and pronunciation/compliance notes before audio generation.`;
    base.suggestions = [
      campaign.elevenLabs.voiceProfile
        ? `Voice profile is set to ${campaign.elevenLabs.voiceProfile}.`
        : "Choose a voice profile that matches the brand profile before generating audio.",
      campaign.assets.voiceScript || campaign.elevenLabs.scriptUrl
        ? "Script URL is present for audio production."
        : "Add the approved script URL or package the scene scripts in the ElevenLabs brief.",
      profile?.regulated ? "Do not generate regulated-brand audio until compliance guardrails are reviewed." : "Keep the narration energetic, clear, and platform-native."
    ];
    base.actions.push({ id: "draft-elevenlabs-notes", label: "Draft Audio Notes" });
  } else if (selectedStageIndex === 3) {
    base.summary = `Codex + Remotion should turn the ElevenLabs audio into a timed production input for Higgsfield Studio.`;
    base.suggestions = [
      campaign.remotion.sourceAudioUrl ? "Source audio is linked." : "Add ElevenLabs audio as the Remotion source input.",
      campaign.remotion.outputUrl ? "Remotion output is ready for Higgsfield." : "Render or link the Remotion output before Higgsfield.",
      "Align captions and visual cuts to the strongest voiceover beats, not arbitrary scene length."
    ];
    base.actions.push({ id: "draft-remotion-notes", label: "Draft Remotion Notes" });
  } else if (selectedStageIndex === 4) {
    base.summary = `Higgsfield Studio should consume the approved Remotion output and return usable clips, not loose experiments.`;
    base.suggestions = [
      campaign.remotion.outputUrl || campaign.assets.remotionOutput
        ? "Approved Remotion output is available for Higgsfield."
        : "Add the Remotion output URL before generation.",
      "Track failed takes openly so the next generation pass learns from them.",
      `Visuals should preserve ${campaign.brand}'s cinematic perspective from the brand profile.`
    ];
  } else if (selectedStageIndex === 5) {
    base.summary = `QA should verify visual quality, audio quality, compliance fit, captions, and publishing readiness before assembly.`;
    base.suggestions = [
      `${campaign.approvals.filter((check) => check.done).length}/${campaign.approvals.length} approval checks are complete.`,
      profile?.regulated ? "Regulated language needs human review before publishing." : "Check that the final piece still feels unmistakably on brand.",
      "Use reviewer comments for trackable improvement requests instead of chat-only feedback."
    ];
  } else if (selectedStageIndex === 6) {
    base.summary = `Assembly should package approved clips, audio, captions, thumbnail, and naming into a durable deliverable.`;
    base.suggestions = [
      campaign.assets.video ? "Final video URL is present." : "Add or prepare the final render URL.",
      campaign.assets.thumbnail ? "Thumbnail URL is present." : "Export a thumbnail that matches the story and platform.",
      "Confirm audio levels before storage and publishing handoff."
    ];
  } else if (selectedStageIndex === 7) {
    base.summary = `The publishing package should make scheduling effortless: caption, hashtags, notes, media, and brand context in one place.`;
    base.suggestions = [
      campaign.publishing.caption ? "Caption draft exists." : "Draft a caption that turns the video insight into a clear audience action.",
      campaign.publishing.hashtags ? "Hashtags are present." : "Add platform-specific hashtags.",
      campaign.publishing.schedule?.length
        ? `${campaign.publishing.schedule.length} publishing slots are drafted in the calendar.`
        : "Draft platform slots in the Publishing Calendar before Blotato handoff.",
      "Platform notes should identify any hook, CTA, cutdown, or approval constraint."
    ];
    base.actions.push({ id: "draft-publishing-package", label: "Draft Package Copy" });
  } else if (selectedStageIndex === 8) {
    base.summary = `Bunny storage should become the clean source of truth between production and publishing.`;
    base.suggestions = [
      campaign.assets.bunnyFolder ? `Folder path: ${campaign.assets.bunnyFolder}.` : "Confirm the Bunny folder path.",
      "Store scripts, audio tracks, Remotion output, final video, thumbnail, captions, and approvals together.",
      "Copy the manifest when handing work to a teammate or publisher."
    ];
  } else {
    base.summary = `Blotato handoff should only happen once the approved package has media, copy, storage links, and platform notes.`;
    base.suggestions = [
      campaign.assets.video ? "Approved media URL is ready." : "Add the approved final video URL.",
      campaign.publishing.caption ? "Caption is ready." : "Draft the publishing caption before handoff.",
      campaign.publishing.schedule?.some((slot) => ["ready", "scheduled"].includes(slot.status))
        ? "At least one calendar slot is ready or scheduled for Blotato control."
        : "Use the Publishing Calendar to move at least one slot to Ready before handoff.",
      "Keep this as a draft until a human approves scheduling or publishing."
    ];
  }

  return base;
}

function getCampaignStatus(campaign) {
  if (campaign.stages.some((stage) => stage.status === "blocked")) return "blocked";
  if (campaign.stages.every((stage) => stage.status === "approved")) return "approved";
  if (campaign.stages.some((stage) => stage.status !== "not-started")) return "in-progress";
  return "not-started";
}

function formatStatus(status) {
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function render() {
  renderFilters();
  renderBrandOptions();
  renderBrandManagerOptions();
  renderMetrics();
  renderCampaignList();
  renderCampaign();
  renderReviewPanel();
  renderAgentActivityLog();
  saveState();
}

function renderFilters() {
  if (elements.stageFilter.options.length) return;
  const options = [{ label: "All Stages", value: "all" }].concat(
    stageTemplates.map((stage, index) => ({ label: stage.filterName || stage.shortName, value: String(index) }))
  );
  elements.stageFilter.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");
}

function renderMetrics() {
  const statuses = state.campaigns.map(getCampaignStatus);
  elements.metricActive.textContent = statuses.filter((status) => status === "in-progress").length;
  elements.metricApproved.textContent = statuses.filter((status) => status === "approved").length;
  elements.metricBlocked.textContent = statuses.filter((status) => status === "blocked").length;
}

function renderCampaignList() {
  const search = elements.campaignSearch.value.trim().toLowerCase();
  const stageFilter = elements.stageFilter.value || "all";
  const campaigns = state.campaigns.filter((campaign) => {
    const matchesSearch = [campaign.brand, campaign.name, campaign.owner, campaign.platform]
      .join(" ")
      .toLowerCase()
      .includes(search);
    const matchesStage =
      stageFilter === "all" || campaign.stages[Number(stageFilter)]?.status !== "not-started";
    return matchesSearch && matchesStage;
  });

  elements.campaignList.innerHTML = "";
  campaigns.forEach((campaign) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `campaign-button ${campaign.id === selectedCampaignId ? "active" : ""}`;
    button.dataset.campaignId = campaign.id;
    const status = getCampaignStatus(campaign);
    button.innerHTML = `
      <strong>${escapeHtml(campaign.name)}</strong>
      <small>${escapeHtml(campaign.brand)} - ${escapeHtml(campaign.platform)} - ${campaign.quantity} outputs</small>
      <span class="button-foot">
        <span class="status-pill ${status}">${formatStatus(status)}</span>
        <small>${getReadiness(campaign)}%</small>
      </span>
    `;
    elements.campaignList.appendChild(button);
  });
}

function renderCampaign() {
  const campaign = getSelectedCampaign();
  elements.emptyState.hidden = Boolean(campaign);
  elements.campaignView.hidden = !campaign;
  if (!campaign) return;

  selectedStageIndex = Math.min(selectedStageIndex, campaign.stages.length - 1);
  const stage = campaign.stages[selectedStageIndex];
  const template = stageTemplates[selectedStageIndex];
  const status = getCampaignStatus(campaign);

  elements.campaignBrand.textContent = campaign.brand;
  elements.campaignTitle.textContent = campaign.name;
  elements.campaignMeta.innerHTML = `
    <span class="meta-pill">${escapeHtml(campaign.platform)}</span>
    <span class="meta-pill">${campaign.quantity} outputs</span>
    <span class="meta-pill">Owner: ${escapeHtml(campaign.owner || "Unassigned")}</span>
    <span class="meta-pill">Due: ${escapeHtml(campaign.dueDate || "Open")}</span>
    <span class="status-pill ${status}">${formatStatus(status)}</span>
  `;
  elements.readinessScore.textContent = `${getReadiness(campaign)}%`;
  elements.readinessBreakdown.innerHTML = getReadinessDetails(campaign)
    .map((item) => `<span><strong>${escapeHtml(item.value)}</strong> ${escapeHtml(item.label)}</span>`)
    .join("");
  elements.nextActionCue.textContent = getNextActionCue(campaign);

  elements.stageTabs.forEach((tab, index) => {
    const stageTemplate = stageTemplates[index];
    tab.classList.toggle("active", index === selectedStageIndex);
    tab.classList.toggle("approved", campaign.stages[index].status === "approved");
    tab.classList.toggle("blocked", campaign.stages[index].status === "blocked");
    tab.setAttribute("aria-current", index === selectedStageIndex ? "step" : "false");
    tab.innerHTML = `
      <span>${String(index + 1).padStart(2, "0")}</span>
      ${escapeHtml(stageTemplate.shortName)}
      <small>${escapeHtml(stageTemplate.toolName)}</small>
    `;
  });

  elements.stageKicker.textContent = `Stage ${String(selectedStageIndex + 1).padStart(2, "0")} - ${template.toolName}`;
  elements.stageTitle.textContent = template.name;
  elements.stageStatus.value = stage.status;
  elements.stageOwner.value = stage.owner || "";
  elements.stageDue.value = stage.dueDate || "";
  elements.stageNotes.value = stage.notes || "";

  elements.stageChecklist.innerHTML = "";
  stage.checks.forEach((check, index) => {
    const item = document.createElement("div");
    item.className = "check-item";
    item.innerHTML = `
      <input id="stage-check-${index}" type="checkbox" ${check.done ? "checked" : ""} data-check-index="${index}" />
      <label for="stage-check-${index}">${escapeHtml(check.label)}</label>
    `;
    elements.stageChecklist.appendChild(item);
  });

  renderScenes(campaign);
  renderApprovals(campaign);
  renderHandoff(campaign);
  renderPublishingCalendar(campaign);
  renderCollaborationHub(campaign);
  renderBrandProfileSummary(campaign);
  renderCreativeDirectionVersions(campaign);
  renderPreviewStudio(campaign);
  renderCoPilot(campaign);
  renderAgentOperations(campaign);
  renderCommandSectionNav(campaign);
}

function renderCommandSectionNav(campaign) {
  elements.commandSectionNav.innerHTML = commandSections
    .map((section) => {
      const isActive = section.target === "#workflow-stage-panel";
      return `
        <button class="command-section-link ${isActive ? "active" : ""}" type="button" data-jump-target="${escapeHtml(section.target)}">
          <strong>${escapeHtml(section.label)}</strong>
          <small>${escapeHtml(section.cue)}</small>
        </button>
      `;
    })
    .join("");
}

function renderPreviewStudio(campaign) {
  const signals = getPreviewSignals(campaign);
  const readyCount = signals.filter((signal) => signal.ready).length;
  const statusClass = readyCount >= 4 ? "approved" : readyCount >= 2 ? "in-progress" : "not-started";
  elements.previewReadinessStatus.className = `status-pill ${statusClass}`;
  elements.previewReadinessStatus.textContent =
    readyCount >= 4 ? "Preview ready" : readyCount >= 2 ? `${readyCount}/5 preview inputs` : "Preview pending";

  elements.previewSignalStrip.innerHTML = signals
    .map(
      (signal) => `
        <article class="${signal.ready ? "ready" : ""}">
          <strong>${escapeHtml(signal.label)}</strong>
          <span>${escapeHtml(signal.detail)}</span>
        </article>
      `
    )
    .join("");

  renderScriptPreview(campaign);
  renderMediaPreview(campaign);
  renderPlatformPreview(campaign);
}

function renderScriptPreview(campaign) {
  const scenes = getScriptPreviewScenes(campaign);
  const scriptedCount = campaign.scenes.filter((scene) => scene.script).length;
  elements.scriptPreviewStatus.className = `status-pill ${scriptedCount ? "in-progress" : "not-started"}`;
  elements.scriptPreviewStatus.textContent = scriptedCount ? `${scriptedCount} scripted` : "Draft";

  if (!scenes.length) {
    elements.scriptPreview.innerHTML = `
      <p class="empty-preview">No scene scripts yet. Use Scene Queue or the OTA Co-Pilot to draft the first audio-led scene.</p>
    `;
    return;
  }

  elements.scriptPreview.innerHTML = scenes
    .map(
      (scene, index) => `
        <article class="script-preview-scene">
          <header>
            <strong>${String(index + 1).padStart(2, "0")} ${escapeHtml(scene.title || "Untitled scene")}</strong>
            <span class="status-pill ${scene.status || "not-started"}">${escapeHtml(formatStatus(scene.status || "not-started"))}</span>
          </header>
          ${scene.script ? `<p>${escapeHtml(scene.script)}</p>` : `<p class="empty-preview">Script missing. Prompt exists, but ElevenLabs needs voiceover text.</p>`}
          ${scene.prompt ? `<small>${escapeHtml(scene.prompt)}</small>` : ""}
        </article>
      `
    )
    .join("");
}

function renderMediaPreview(campaign) {
  const assets = getPreviewAssets(campaign);
  const videoMarkup = assets.videoUrl
    ? `
      <figure class="media-frame">
        <video controls preload="metadata" src="${escapeHtml(assets.videoUrl)}"></video>
        <figcaption>Video reference <a href="${escapeHtml(assets.videoUrl)}" target="_blank" rel="noreferrer">Open source</a></figcaption>
      </figure>
    `
    : `
      <figure class="media-frame empty-media">
        <div>Video pending</div>
        <figcaption>Add final video, Remotion output, or Bunny video URL.</figcaption>
      </figure>
    `;

  const audioMarkup = assets.audioUrl
    ? `
      <div class="audio-preview">
        <strong>Audio preview</strong>
        <audio controls src="${escapeHtml(assets.audioUrl)}"></audio>
        <a href="${escapeHtml(assets.audioUrl)}" target="_blank" rel="noreferrer">Open audio source</a>
      </div>
    `
    : `
      <div class="audio-preview empty-preview">
        <strong>Audio pending</strong>
        <span>Add ElevenLabs audio or source audio URL.</span>
      </div>
    `;

  const thumbnailMarkup = assets.thumbnailUrl
    ? `
      <figure class="thumbnail-preview">
        <img src="${escapeHtml(assets.thumbnailUrl)}" alt="Campaign thumbnail preview" loading="lazy" />
        <figcaption>Thumbnail reference <a href="${escapeHtml(assets.thumbnailUrl)}" target="_blank" rel="noreferrer">Open image</a></figcaption>
      </figure>
    `
    : `
      <figure class="thumbnail-preview empty-media">
        <div>Thumbnail pending</div>
        <figcaption>Add thumbnail URL to inspect feed readability.</figcaption>
      </figure>
    `;

  elements.mediaPreview.innerHTML = `${videoMarkup}${audioMarkup}${thumbnailMarkup}`;
}

function renderPlatformPreview(campaign) {
  const assets = getPreviewAssets(campaign);
  const profiles = getPlatformPreviewProfiles(campaign);
  const caption = campaign.publishing.caption || "Caption draft pending. Draft the hook, value, and CTA before publishing.";
  const hashtags = campaign.publishing.hashtags || "#HashtagsPending";

  elements.platformPreview.innerHTML = profiles
    .map(
      (profile) => `
        <article class="platform-preview-card ${profile.className}">
          <div class="platform-frame">
            ${
              assets.thumbnailUrl
                ? `<img src="${escapeHtml(assets.thumbnailUrl)}" alt="${escapeHtml(profile.name)} thumbnail preview" loading="lazy" />`
                : `<div class="platform-frame-empty">${escapeHtml(profile.frame)}</div>`
            }
          </div>
          <div class="platform-preview-copy">
            <strong>${escapeHtml(profile.name)}</strong>
            <small>${escapeHtml(profile.frame)}</small>
            <p>${escapeHtml(caption)}</p>
            <span>${escapeHtml(hashtags)}</span>
            <em>${escapeHtml(profile.note)}</em>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCoPilot(campaign) {
  const guidance = getCoPilotGuidance(campaign);
  elements.coPilotKicker.textContent = guidance.kicker;
  elements.coPilotTitle.textContent = guidance.title;
  elements.coPilotStatus.className = `status-pill ${guidance.status === "Ready" ? "approved" : "in-progress"}`;
  elements.coPilotStatus.textContent = guidance.status;
  elements.coPilotSummary.textContent = guidance.summary;
  elements.coPilotSuggestions.innerHTML = "";
  guidance.suggestions.forEach((suggestion) => {
    const item = document.createElement("article");
    item.className = "copilot-suggestion";
    item.textContent = suggestion;
    elements.coPilotSuggestions.appendChild(item);
  });
  elements.coPilotActions.innerHTML = "";
  guidance.actions.forEach((action) => {
    const button = document.createElement("button");
    button.className = "mini-button";
    button.type = "button";
    button.dataset.copilotAction = action.id;
    button.textContent = action.label;
    elements.coPilotActions.appendChild(button);
  });
}

function renderBrandProfileSummary(campaign) {
  const profile = getBrandProfile(campaign.brand);
  elements.brandProfileSummary.innerHTML = "";
  if (!profile) {
    elements.brandProfileSummary.innerHTML = `<p class="meta-row">No brand profile found for ${escapeHtml(campaign.brand)}.</p>`;
    return;
  }

  const regulatedClass = profile.regulated ? "blocked" : "approved";
  elements.brandProfileSummary.innerHTML = `
    <div class="summary-row">
      <span class="status-pill ${regulatedClass}">${profile.regulated ? "Regulated" : "Standard"}</span>
      <span class="meta-pill">${escapeHtml(profile.platforms || "Platforms open")}</span>
    </div>
    <p><strong>Voice:</strong> ${escapeHtml(profile.voice || "Not set")}</p>
    <p><strong>Audience:</strong> ${escapeHtml(profile.audience || "Not set")}</p>
    <p><strong>Offers:</strong> ${escapeHtml(profile.offers || "Not set")}</p>
    <p><strong>Cinematic perspective:</strong> ${escapeHtml(profile.perspective || "Not set")}</p>
  `;
}

function renderCreativeDirectionVersions(campaign) {
  elements.creativeDirectionVersions.innerHTML = "";
  const versions = [...(campaign.creativeDirectionVersions || [])].reverse();
  if (!versions.length) {
    elements.creativeDirectionVersions.innerHTML = `<p class="meta-row">No creative direction versions yet.</p>`;
    return;
  }

  versions.forEach((version) => {
    const card = document.createElement("article");
    card.className = "version-card";
    const active = version.value === campaign.creativeDirection;
    card.innerHTML = `
      <header>
        <strong>${escapeHtml(version.source)}</strong>
        <small>${new Date(version.createdAt).toLocaleString()}</small>
      </header>
      <p>${escapeHtml(version.value)}</p>
      <div class="scene-actions">
        <span class="status-pill ${active ? "approved" : "not-started"}">${active ? "Active" : "Archived"}</span>
        <button class="mini-button" type="button" data-use-direction="${version.id}">Use Version</button>
      </div>
    `;
    elements.creativeDirectionVersions.appendChild(card);
  });
}

function renderAgentActivityLog() {
  if (!elements.agentActivityLog) return;
  elements.agentActivityLog.innerHTML = "";
  const activity = [...(state.agentActivity || [])].reverse().slice(0, 12);
  if (!activity.length) {
    elements.agentActivityLog.innerHTML = `<p class="meta-row">No agent activity recorded yet.</p>`;
    return;
  }

  activity.forEach((item) => {
    const row = document.createElement("article");
    row.className = "activity-item";
    row.innerHTML = `
      <strong>${escapeHtml(item.type)}</strong>
      <p>${escapeHtml(item.message)}</p>
      <small>${new Date(item.createdAt).toLocaleString()}</small>
    `;
    elements.agentActivityLog.appendChild(row);
  });
}

function getViralLiftScore(campaign) {
  const signals = campaign.agentOps?.performanceSignals || [];
  if (!signals.length) return 0;
  const score = Math.round(signals.reduce((sum, signal) => sum + Number(signal.score || 0), 0) / signals.length);
  return Math.max(0, Math.min(score, 100));
}

function getSignalStatus(score) {
  if (score >= 75) return "approved";
  if (score >= 50) return "in-progress";
  if (score >= 35) return "needs-review";
  return "not-started";
}

function renderAgentOperations(campaign) {
  if (!elements.agentOpsMetrics) return;
  const ops = campaign.agentOps || createAgentOps(campaign);
  const viralLift = getViralLiftScore(campaign);
  const openTasks = ops.tasks.filter((task) => task.status !== "completed").length;
  const repurposeCount = ops.repurposeCandidates.length;
  const clipCount = ops.restream.clipCandidates.length;
  const approvalCount = ops.approvals.filter((approval) => approval.status !== "approved").length;

  elements.viralLiftScore.className = `status-pill ${getSignalStatus(viralLift)}`;
  elements.viralLiftScore.textContent = `${viralLift} lift`;
  elements.agentOpsMetrics.innerHTML = `
    <article>
      <strong>${openTasks}</strong>
      <span>open agent tasks</span>
    </article>
    <article>
      <strong>${viralLift}</strong>
      <span>viral lift score</span>
    </article>
    <article>
      <strong>${repurposeCount}</strong>
      <span>repurpose candidates</span>
    </article>
    <article>
      <strong>${clipCount}</strong>
      <span>Restream clips</span>
    </article>
    <article>
      <strong>${approvalCount}</strong>
      <span>approval holds</span>
    </article>
  `;

  renderAgentTaskQueue(ops.tasks);
  renderPerformanceIntelligence(ops.performanceSignals);
  renderRepurposeCandidates(ops.repurposeCandidates);
  renderRestreamOps(ops.restream);
  renderDescriptOps(ops.descript);
  renderAgentApprovalConsole(ops.approvals);
}

function renderAgentTaskQueue(tasks) {
  renderAgentOpsList(elements.agentTaskQueue, tasks, (task) => `
    <article class="agent-ops-item">
      <header>
        <strong>${escapeHtml(task.agent)}</strong>
        <span class="status-pill ${task.status === "completed" ? "approved" : task.status === "running" ? "in-progress" : "not-started"}">${escapeHtml(formatStatus(task.status))}</span>
      </header>
      <p>${escapeHtml(task.action)}</p>
      <small>${new Date(task.createdAt).toLocaleString()}</small>
    </article>
  `);
}

function renderPerformanceIntelligence(signals) {
  renderAgentOpsList(elements.performanceIntelligence, signals, (signal) => `
    <article class="agent-ops-item">
      <header>
        <strong>${escapeHtml(signal.source)}</strong>
        <span class="status-pill ${getSignalStatus(signal.score)}">${Number(signal.score || 0)} score</span>
      </header>
      <p>${escapeHtml(signal.signal)}</p>
      <small>${new Date(signal.createdAt).toLocaleString()}</small>
    </article>
  `);
}

function renderRepurposeCandidates(candidates) {
  renderAgentOpsList(elements.repurposeCandidates, candidates, (candidate) => `
    <article class="agent-ops-item">
      <header>
        <strong>${escapeHtml(candidate.format)}</strong>
        <span class="status-pill ${candidate.status === "promoted" ? "approved" : "needs-review"}">${escapeHtml(formatStatus(candidate.status))}</span>
      </header>
      <p>${escapeHtml(candidate.idea)}</p>
      <small>${escapeHtml(candidate.source)} - ${new Date(candidate.createdAt).toLocaleString()}</small>
    </article>
  `);
}

function renderRestreamOps(restream) {
  const items = [
    {
      title: "Broadcast status",
      body: `${formatStatus(restream.status)} - ${restream.broadcastTitle}`,
      meta: restream.liveNotes
    },
    ...restream.clipCandidates.map((clip) => ({
      title: clip.title,
      body: clip.reason,
      meta: `${clip.status} - ${new Date(clip.createdAt).toLocaleString()}`
    }))
  ];
  renderAgentOpsList(elements.restreamOps, items, (item) => `
    <article class="agent-ops-item">
      <header>
        <strong>${escapeHtml(item.title)}</strong>
      </header>
      <p>${escapeHtml(item.body)}</p>
      <small>${escapeHtml(item.meta)}</small>
    </article>
  `);
}

function renderDescriptOps(descript) {
  const items = [
    {
      title: "Descript status",
      body: formatStatus(descript.status),
      meta: descript.projectRef || "No Descript project reference yet."
    },
    {
      title: "Edit plan",
      body: descript.editPlan,
      meta: descript.enhancedAssetUrl || "Enhanced asset URL pending."
    }
  ];
  renderAgentOpsList(elements.descriptOps, items, (item) => `
    <article class="agent-ops-item">
      <header>
        <strong>${escapeHtml(item.title)}</strong>
      </header>
      <p>${escapeHtml(item.body)}</p>
      <small>${escapeHtml(item.meta)}</small>
    </article>
  `);
}

function renderAgentApprovalConsole(approvals) {
  renderAgentOpsList(elements.agentApprovalConsole, approvals, (approval) => `
    <article class="agent-ops-item">
      <header>
        <strong>${escapeHtml(approval.label)}</strong>
        <span class="status-pill ${approval.status === "approved" ? "approved" : "blocked"}">${escapeHtml(formatStatus(approval.status))}</span>
      </header>
      <small>${new Date(approval.createdAt).toLocaleString()}</small>
    </article>
  `);
}

function renderAgentOpsList(container, items, template) {
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = `<p class="meta-row">No records yet.</p>`;
    return;
  }
  container.innerHTML = items.map(template).join("");
}

function getCampaignReviewRequests(campaign) {
  if (!campaign) return [];
  const topLevelRequests = state.reviewRequests.filter((request) => request.campaignId === campaign.id);
  return [...(campaign.reviewRequests || []), ...topLevelRequests].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

function getActiveReviewSection() {
  return reviewSections.find((section) => section.id === selectedReviewSectionId) || reviewSections[0];
}

function getEnhancementIdeaUrl(sectionId = selectedReviewSectionId) {
  const params = new URLSearchParams();
  params.set("section", sectionId || reviewSections[0].id);
  if (selectedCampaignId) params.set("campaign", selectedCampaignId);
  return `./enhancement-ideas.html?${params.toString()}`;
}

function renderReviewPanel() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const allRequests = getCampaignReviewRequests(campaign);
  const activeSection = getActiveReviewSection();
  const activeRequests = allRequests.filter((request) => request.sectionId === activeSection.id);

  if (elements.openEnhancementIdeas) {
    elements.openEnhancementIdeas.href = getEnhancementIdeaUrl(activeSection.id);
  }

  if (!elements.reviewSectionButtons) {
    elements.reviewCount.className = `status-pill ${allRequests.length ? "needs-review" : "not-started"}`;
    elements.reviewCount.textContent = `${allRequests.length} ${allRequests.length === 1 ? "idea" : "ideas"}`;
    elements.reviewRequestList.innerHTML = "";
    const summary = document.createElement("p");
    summary.className = "meta-row";
    summary.textContent = allRequests.length
      ? `${allRequests.length} enhancement ${allRequests.length === 1 ? "idea has" : "ideas have"} been captured for this campaign.`
      : "No enhancement ideas captured for this campaign yet.";
    elements.reviewRequestList.appendChild(summary);
    return;
  }

  elements.reviewSectionButtons.innerHTML = "";
  reviewSections.forEach((section) => {
    const count = allRequests.filter((request) => request.sectionId === section.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `review-section-button ${section.id === selectedReviewSectionId ? "active" : ""}`;
    button.dataset.reviewSection = section.id;
    button.innerHTML = `${escapeHtml(section.name)}<small>${count} requests</small>`;
    elements.reviewSectionButtons.appendChild(button);
  });

  elements.reviewCount.className = `status-pill ${allRequests.length ? "needs-review" : "not-started"}`;
  elements.reviewCount.textContent = `${allRequests.length} ${allRequests.length === 1 ? "request" : "requests"}`;
  elements.reviewRequestList.innerHTML = "";

  if (!activeRequests.length) {
    const empty = document.createElement("p");
    empty.className = "meta-row";
    empty.textContent = `No requests for ${activeSection.name}`;
    elements.reviewRequestList.appendChild(empty);
    return;
  }

  activeRequests.forEach((request) => {
    const card = document.createElement("article");
    card.className = "review-request-card";
    card.innerHTML = `
      <header>
        <strong>${escapeHtml(request.priority)}</strong>
        <small>${escapeHtml(request.reviewer || "Reviewer")} - ${new Date(request.createdAt).toLocaleString()}</small>
      </header>
      <p>${escapeHtml(request.comment)}</p>
      <a href="${escapeHtml(request.issueUrl)}" target="_blank" rel="noreferrer">Open GitHub issue draft</a>
    `;
    elements.reviewRequestList.appendChild(card);
  });
}

function renderCollaborationHub(campaign) {
  const metrics = getCollaborationMetrics(campaign);
  elements.collaborationNotificationSummary.className = `status-pill ${metrics.open || metrics.waiting ? "needs-review" : "approved"}`;
  const activeThreads = metrics.open + metrics.waiting;
  elements.collaborationNotificationSummary.textContent =
    activeThreads === 1 ? "1 active thread" : `${activeThreads} active threads`;

  elements.collaborationMetrics.innerHTML = [
    { label: "Open threads", value: metrics.open },
    { label: "Waiting", value: metrics.waiting },
    { label: "Mentions", value: metrics.mentions },
    { label: "Resolved", value: metrics.resolved }
  ]
    .map(
      (item) => `
        <article>
          <strong>${item.value}</strong>
          <span>${escapeHtml(item.label)}</span>
        </article>
      `
    )
    .join("");

  const activeValue = elements.collaborationSection.value || selectedReviewSectionId;
  elements.collaborationSection.innerHTML = reviewSections
    .map((section) => `<option value="${escapeHtml(section.id)}">${escapeHtml(section.name)}</option>`)
    .join("");
  elements.collaborationSection.value = reviewSections.some((section) => section.id === activeValue)
    ? activeValue
    : selectedReviewSectionId;

  if (!elements.collaboratorName.value.trim()) elements.collaboratorName.value = campaign.owner || "";

  const threads = (campaign.collaborationThreads || [])
    .slice()
    .sort((a, b) => {
      if (a.status === "resolved" && b.status !== "resolved") return 1;
      if (a.status !== "resolved" && b.status === "resolved") return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (!threads.length) {
    elements.collaborationThreadList.innerHTML = `<p class="meta-row">No internal collaboration threads yet.</p>`;
    return;
  }

  elements.collaborationThreadList.innerHTML = threads
    .map(
      (thread) => `
        <article class="collaboration-thread-card ${thread.status}" data-collaboration-thread="${escapeHtml(thread.id)}">
          <header>
            <div>
              <strong>${escapeHtml(thread.sectionName)}</strong>
              <small>${escapeHtml(thread.author)} - ${escapeHtml(thread.role)} - ${new Date(thread.createdAt).toLocaleString()}</small>
            </div>
            <span class="status-pill ${thread.status === "resolved" ? "approved" : thread.status === "waiting" ? "needs-review" : "in-progress"}">${escapeHtml(formatStatus(thread.status))}</span>
          </header>
          <p>${escapeHtml(thread.note)}</p>
          ${thread.mentions ? `<em>${escapeHtml(thread.mentions)}</em>` : ""}
          <div class="collaboration-thread-actions">
            <button class="mini-button" type="button" data-thread-focus="${escapeHtml(thread.id)}">Focus</button>
            <button class="mini-button" type="button" data-thread-toggle="${escapeHtml(thread.id)}">${thread.status === "resolved" ? "Reopen" : "Resolve"}</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderScenes(campaign) {
  elements.sceneList.innerHTML = "";
  if (!campaign.scenes.length) {
    const empty = document.createElement("p");
    empty.className = "meta-row";
    empty.textContent = "No scenes added";
    elements.sceneList.appendChild(empty);
    return;
  }

  campaign.scenes.forEach((scene) => {
    const card = document.createElement("article");
    card.className = "scene-card";
    card.innerHTML = `
      <header>
        <strong>${escapeHtml(scene.title)}</strong>
        <span class="status-pill ${scene.status || "not-started"}">${formatStatus(scene.status || "not-started")}</span>
      </header>
      ${scene.script ? `<p><strong>Script:</strong> ${escapeHtml(scene.script)}</p>` : ""}
      <p>${escapeHtml(scene.prompt)}</p>
      ${scene.compliance ? `<p>${escapeHtml(scene.compliance)}</p>` : ""}
      <div class="scene-actions">
        <button class="mini-button" type="button" data-scene-status="in-progress" data-scene-id="${scene.id}">Generating</button>
        <button class="mini-button" type="button" data-scene-status="needs-review" data-scene-id="${scene.id}">Review</button>
        <button class="mini-button" type="button" data-scene-status="approved" data-scene-id="${scene.id}">Approve</button>
        <button class="mini-button" type="button" data-delete-scene="${scene.id}">Remove</button>
      </div>
    `;
    elements.sceneList.appendChild(card);
  });
}

function renderApprovals(campaign) {
  const approved = campaign.approvals.filter((check) => check.done).length;
  const ready = approved === campaign.approvals.length;
  elements.approvalStatus.className = `status-pill ${ready ? "approved" : "needs-review"}`;
  elements.approvalStatus.textContent = ready ? "Approved" : `${approved}/${campaign.approvals.length}`;
  elements.approvalChecks.innerHTML = "";

  campaign.approvals.forEach((check, index) => {
    const item = document.createElement("div");
    item.className = "approval-item";
    item.innerHTML = `
      <input id="approval-check-${index}" type="checkbox" ${check.done ? "checked" : ""} data-approval-index="${index}" />
      <label for="approval-check-${index}">${escapeHtml(check.label)}</label>
    `;
    elements.approvalChecks.appendChild(item);
  });
}

function renderHandoff(campaign) {
  elements.bunnyFolder.value = campaign.assets.bunnyFolder || "";
  elements.assetVideo.value = campaign.assets.video || "";
  elements.assetThumbnail.value = campaign.assets.thumbnail || "";
  elements.assetVoiceover.value = campaign.assets.voiceover || "";
  elements.assetVoiceScript.value = campaign.assets.voiceScript || "";
  elements.assetRemotionOutput.value = campaign.assets.remotionOutput || "";
  elements.assetCaptionDoc.value = campaign.assets.captionDoc || "";
  elements.assetScenes.value = campaign.assets.scenes || "";
  elements.assetApprovalDoc.value = campaign.assets.approvalDoc || "";
  elements.elevenLabsAccount.value = campaign.elevenLabs.accountLogin || "";
  elements.elevenLabsStatus.value = campaign.elevenLabs.apiStatus || "active";
  elements.elevenLabsVoice.value = campaign.elevenLabs.voiceProfile || "";
  elements.elevenLabsScriptUrl.value = campaign.elevenLabs.scriptUrl || "";
  elements.elevenLabsAudioUrl.value = campaign.elevenLabs.voiceoverUrl || "";
  elements.elevenLabsNotes.value = campaign.elevenLabs.notes || "";
  elements.remotionSourceAudio.value = campaign.remotion.sourceAudioUrl || "";
  elements.remotionOutputUrl.value = campaign.remotion.outputUrl || "";
  elements.remotionNotes.value = campaign.remotion.compositionNotes || "";
  elements.captionText.value = campaign.publishing.caption || "";
  elements.hashtags.value = campaign.publishing.hashtags || "";
  elements.platformNotes.value = campaign.publishing.platformNotes || "";
}

function renderPublishingCalendar(campaign) {
  const platforms = getCampaignPlatforms(campaign);
  elements.schedulePlatform.innerHTML = platforms
    .map((platform) => `<option value="${escapeHtml(platform)}">${escapeHtml(platform)}</option>`)
    .join("");
  const nextSlot = campaign.publishing.schedule.find((slot) => slot.status !== "published") || campaign.publishing.schedule[0];
  elements.schedulePlatform.value = nextSlot?.platform || platforms[0] || "";
  elements.scheduleDate.value = nextSlot?.date || toDateInputValue(getScheduleBaseDate(campaign));
  elements.scheduleTime.value = nextSlot?.time || "09:00";
  elements.scheduleStatus.value = nextSlot?.status || "draft";
  elements.scheduleNotes.value = "";

  const controlledCount = campaign.publishing.schedule.filter((slot) =>
    ["ready", "scheduled", "published"].includes(slot.status)
  ).length;
  elements.scheduleStatusSummary.className = `status-pill ${controlledCount ? "approved" : "not-started"}`;
  elements.scheduleStatusSummary.textContent = `${controlledCount}/${campaign.publishing.schedule.length || 0} controlled slots`;

  const windowDays = getScheduleWindow(campaign);
  elements.publishingCalendarGrid.innerHTML = windowDays
    .map((day) => {
      const dateValue = toDateInputValue(day);
      const slots = campaign.publishing.schedule
        .filter((slot) => slot.date === dateValue)
        .sort((a, b) => `${a.time || ""}`.localeCompare(`${b.time || ""}`));
      return `
        <article class="calendar-day ${slots.length ? "has-slots" : ""}">
          <header>
            <strong>${day.toLocaleDateString(undefined, { weekday: "short" })}</strong>
            <span>${day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </header>
          <div class="calendar-day-slots">
            ${
              slots.length
                ? slots
                    .map(
                      (slot) => `
                        <button class="calendar-slot ${getScheduleStatusClass(slot.status)}" type="button" data-focus-slot="${escapeHtml(slot.id)}">
                          <strong>${escapeHtml(slot.time || "Open")}</strong>
                          <span>${escapeHtml(slot.platform)}</span>
                        </button>
                      `
                    )
                    .join("")
                : `<p>No slots</p>`
            }
          </div>
        </article>
      `;
    })
    .join("");

  if (!campaign.publishing.schedule.length) {
    elements.publishingScheduleList.innerHTML = `<p class="meta-row">No publishing slots yet. Use Suggest Slots or add a platform slot manually.</p>`;
    return;
  }

  elements.publishingScheduleList.innerHTML = campaign.publishing.schedule
    .slice()
    .sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`))
    .map(
      (slot) => `
        <article class="schedule-slot-card" data-slot-card="${escapeHtml(slot.id)}">
          <div>
            <strong>${escapeHtml(slot.platform)}</strong>
            <p>${escapeHtml(slot.date || "Date open")} at ${escapeHtml(slot.time || "time open")}</p>
            ${slot.notes ? `<small>${escapeHtml(slot.notes)}</small>` : ""}
          </div>
          <div class="schedule-slot-actions">
            <span class="status-pill ${getScheduleStatusClass(slot.status)}">${escapeHtml(formatStatus(slot.status))}</span>
            <button class="mini-button" type="button" data-cycle-schedule-status="${escapeHtml(slot.id)}">Advance</button>
            <button class="mini-button" type="button" data-delete-schedule-slot="${escapeHtml(slot.id)}">Remove</button>
          </div>
        </article>
      `
    )
    .join("");
}

function updateStageField(field, value) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  campaign.stages[selectedStageIndex][field] = value;
  autoApproveStage(campaign.stages[selectedStageIndex]);
  render();
}

function autoApproveStage(stage) {
  if (stage.checks.every((check) => check.done) && stage.status !== "blocked") {
    stage.status = "approved";
  }
}

function buildStageNote(campaign) {
  const profile = getBrandProfile(campaign.brand);
  const template = stageTemplates[selectedStageIndex];
  const openCheck = getFirstOpenCheck(campaign.stages[selectedStageIndex]);
  return [
    `Co-pilot guidance for ${template.shortName}: keep ${campaign.brand} aligned to ${profile?.perspective || "the active brand profile"}.`,
    openCheck ? `Next recommended completion: ${openCheck.label}.` : "This stage has no open checklist items.",
    profile?.regulated ? "Maintain compliance guardrails before downstream generation or publishing." : "Keep the asset useful, specific, and on-brand."
  ].join("\n");
}

function buildSuggestedScene(campaign) {
  const profile = getBrandProfile(campaign.brand);
  const ordinal = campaign.scenes.length + 1;
  const tension = profile?.regulated
    ? "the costly operational risk hiding in a normal day"
    : "the moment the audience realizes the old workflow is too slow";
  return {
    id: makeId(),
    title: `Co-Pilot Scene ${ordinal}`,
    script: `Open on ${tension}. Reframe it through ${campaign.brand}'s point of view, then show the clear next action the audience can take.`,
    prompt: `${profile?.perspective || "Brand-native cinematic perspective"}, scene ${ordinal}, clear before-and-after storytelling, platform-ready composition, clean lighting, high-signal visual detail.`,
    compliance: profile?.regulated ? buildComplianceGuardrails(campaign.brand).split("\n")[0] || "" : "",
    status: "not-started"
  };
}

function draftBrandProfileFields() {
  const name = getBrandFormField("name").value.trim() || "New OTA Brand";
  const regulated = getBrandFormField("regulated").checked;
  if (!getBrandFormField("name").value.trim()) getBrandFormField("name").value = name;
  if (!getBrandFormField("voice").value.trim() || containsHelpIntent(getBrandFormField("voice").value)) {
    getBrandFormField("voice").value = buildBrandVoiceDraft(name, regulated);
  }
  if (!getBrandFormField("audience").value.trim() || containsHelpIntent(getBrandFormField("audience").value)) {
    getBrandFormField("audience").value = buildBrandAudienceDraft(name);
  }
  if (!getBrandFormField("offers").value.trim() || containsHelpIntent(getBrandFormField("offers").value)) {
    getBrandFormField("offers").value = buildBrandOffersDraft(name);
  }
  if (!getBrandFormField("perspective").value.trim() || containsHelpIntent(getBrandFormField("perspective").value)) {
    getBrandFormField("perspective").value = buildBrandPerspectiveDraft(regulated);
  }
  if (regulated && !getBrandFormField("guardrails").value.trim()) {
    getBrandFormField("guardrails").value =
      "Avoid guarantees, sensitive claims, unsupported outcomes, and personalized advice. Route final copy through human review before publishing.";
  }
  if (!getBrandFormField("platforms").value.trim()) {
    getBrandFormField("platforms").value = "TikTok, Instagram Reels, YouTube Shorts, LinkedIn";
  }
  renderBrandDialogCoPilot();
  showToast("Brand profile draft applied");
}

function draftBrandVoiceField() {
  const name = getBrandFormField("name").value.trim() || "New OTA Brand";
  const regulated = getBrandFormField("regulated").checked;
  getBrandFormField("voice").value = buildBrandVoiceDraft(name, regulated);
  brandCoPilotReply = `I drafted a brand voice for ${name}. Review the wording, then adjust anything that should sound more specific to the brand.`;
  renderBrandDialogCoPilot();
  showToast("Brand voice drafted");
}

function answerBrandCoPilotPrompt() {
  const prompt = document.querySelector("#brandCoPilotPrompt")?.value.trim() || "";
  const name = getBrandFormField("name").value.trim() || "this brand";
  if (!prompt) {
    brandCoPilotReply = "Ask me for the specific field you want help with: brand voice, audience, offers, cinematic perspective, or compliance guardrails.";
    renderBrandDialogCoPilot();
    return;
  }
  if (/voice|tone|sound/i.test(prompt)) {
    brandCoPilotReply = `For ${name}, start with voice. I recommend using Draft Brand Voice, then making it more specific with any phrases, values, or examples the brand must always sound like.`;
  } else if (/audience|viewer|buyer|customer/i.test(prompt)) {
    brandCoPilotReply = `For ${name}, define the audience by the moment they care most. I can draft this from the brand context, then you can narrow it to the highest-value buyer or viewer.`;
  } else if (/offer|monet|revenue|sell/i.test(prompt)) {
    brandCoPilotReply = `For ${name}, offers should connect attention to a next business action: leads, services, education, sponsorships, partnerships, or productized assets.`;
  } else if (/visual|cinematic|perspective|scene|story/i.test(prompt)) {
    brandCoPilotReply = `For ${name}, cinematic perspective should become a repeatable lens for scripts and scenes: point of view, pacing, camera feel, emotional stakes, and proof style.`;
  } else if (/compliance|regulated|guardrail|claim/i.test(prompt)) {
    brandCoPilotReply = `For ${name}, compliance guardrails should be active only when the regulated flag is on. CRS and The VFO require explicit conservative guardrails before production.`;
  } else {
    brandCoPilotReply = `I can help shape ${name}'s voice, audience, offers, cinematic perspective, and guardrails. Tell me which field you want to build first, or use Draft Missing Profile.`;
  }
  renderBrandDialogCoPilot();
}

function draftSceneFields() {
  const campaign = getSelectedCampaign();
  const scene = campaign
    ? buildSuggestedScene(campaign)
    : {
        title: "Co-Pilot Scene",
        script: "Open with the audience's familiar tension, reframe it with the brand insight, and close with a clear next action.",
        prompt:
          "Brand-native cinematic scene, clear before-and-after storytelling, clean lighting, platform-ready composition.",
        compliance: ""
      };
  if (!elements.sceneForm.elements.title.value.trim()) elements.sceneForm.elements.title.value = scene.title;
  if (!elements.sceneForm.elements.script.value.trim()) elements.sceneForm.elements.script.value = scene.script;
  if (!elements.sceneForm.elements.prompt.value.trim()) elements.sceneForm.elements.prompt.value = scene.prompt;
  if (!elements.sceneForm.elements.compliance.value.trim()) elements.sceneForm.elements.compliance.value = scene.compliance;
  renderSceneDialogCoPilot();
  showToast("Scene draft applied");
}

function applyDialogCoPilotAction(actionId) {
  if (actionId === "campaign-refresh-direction") {
    syncCampaignSetupFields({ forceCreative: true });
    getCampaignFormField("creativeDirection").focus();
    showToast("Direction refreshed");
    return;
  }

  if (actionId === "campaign-apply-guardrails") {
    const brandName = getCampaignFormBrandName();
    const guardrails = getCampaignFormField("guardrails");
    const value = buildComplianceGuardrails(brandName);
    if (!value) {
      showToast("No regulated guardrails for this brand");
      return;
    }
    guardrails.disabled = false;
    guardrails.value = value;
    guardrails.dataset.generated = "true";
    renderCampaignDialogCoPilot();
    showToast("Guardrails applied");
    return;
  }

  if (actionId === "scene-draft-fields") {
    draftSceneFields();
    return;
  }

  if (actionId === "brand-draft-voice") {
    draftBrandVoiceField();
    return;
  }

  if (actionId === "brand-answer-prompt") {
    answerBrandCoPilotPrompt();
    return;
  }

  if (actionId === "brand-draft-profile") {
    draftBrandProfileFields();
  }
}

function applyCoPilotAction(actionId) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const stage = campaign.stages[selectedStageIndex];

  if (actionId === "complete-next-check") {
    const index = stage.checks.findIndex((check) => !check.done);
    if (index === -1) {
      showToast("No open checks in this stage");
      return;
    }
    stage.checks[index].done = true;
    autoApproveStage(stage);
    addAgentActivity("Co-pilot", `Completed checklist item "${stage.checks[index].label}" for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "apply-stage-note") {
    const note = buildStageNote(campaign);
    stage.notes = stage.notes ? `${stage.notes}\n\n${note}` : note;
    addAgentActivity("Co-pilot", `Added stage guidance note for ${stageTemplates[selectedStageIndex].shortName}.`, campaign.id);
  }

  if (actionId === "regenerate-direction") {
    const draft = buildCreativeDirectionDraft(campaign);
    campaign.creativeDirection = draft;
    campaign.creativeDirectionVersions.push(createCreativeDirectionVersion(draft, "Co-pilot regenerated direction"));
    stage.checks[1].done = true;
    addAgentActivity("Co-pilot", `Regenerated on-brand creative direction for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "generate-scene-idea") {
    const scene = buildSuggestedScene(campaign);
    campaign.scenes.push(scene);
    stage.checks[0].done = true;
    stage.checks[1].done = true;
    stage.checks[3].done = true;
    addAgentActivity("Co-pilot", `Drafted scene "${scene.title}" for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "draft-elevenlabs-notes") {
    const profile = getBrandProfile(campaign.brand);
    campaign.elevenLabs.voiceProfile = campaign.elevenLabs.voiceProfile || `${campaign.brand} narrator`;
    campaign.elevenLabs.notes = [
      `Voice should match ${profile?.voice || "the active brand voice"}.`,
      "Read with clear pacing, strong hook emphasis, and enough pauses for caption beats.",
      profile?.regulated ? "Avoid language that implies guarantees or unreviewed regulated claims." : "Keep delivery confident, useful, and platform-native."
    ].join("\n");
    addAgentActivity("Co-pilot", `Drafted ElevenLabs audio notes for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "draft-remotion-notes") {
    campaign.remotion.sourceAudioUrl = campaign.remotion.sourceAudioUrl || campaign.elevenLabs.voiceoverUrl || campaign.assets.voiceover;
    campaign.remotion.compositionNotes = [
      "Cut visuals to voiceover beats and preserve hook clarity in the first three seconds.",
      "Use captions as a storytelling layer, not just a transcript.",
      "Export a clean production input for Higgsfield Studio with all timing locked."
    ].join("\n");
    addAgentActivity("Co-pilot", `Drafted Codex + Remotion composition notes for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "draft-publishing-package") {
    const profile = getBrandProfile(campaign.brand);
    campaign.publishing.caption =
      campaign.publishing.caption ||
      `${campaign.name} shows how ${campaign.brand} turns a familiar problem into a clearer next move.`;
    campaign.publishing.hashtags =
      campaign.publishing.hashtags || "#OTASocialEngine #AIWorkflow #ContentEngine";
    campaign.publishing.platformNotes = [
      `Keep tone aligned to ${profile?.voice || "the active brand voice"}.`,
      "Use the strongest before-and-after moment as the hook.",
      profile?.regulated ? "Hold as draft until compliance review is complete." : "Ready for human publishing review after asset URLs are attached."
    ].join("\n");
    if (!campaign.publishing.schedule.length) {
      campaign.publishing.schedule = createSuggestedPublishingSchedule(campaign);
      campaign.publishing.status = "calendar-drafted";
    }
    addAgentActivity("Co-pilot", `Drafted publishing package copy for ${campaign.name}.`, campaign.id);
  }

  render();
  showToast("Co-pilot update applied");
}

function seedPublishingSchedule() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  campaign.publishing.schedule = createSuggestedPublishingSchedule(campaign);
  campaign.publishing.status = "calendar-drafted";
  addAgentActivity("Publishing control", `Suggested ${campaign.publishing.schedule.length} publishing slots for ${campaign.name}.`, campaign.id);
  render();
  showToast("Publishing slots suggested");
}

function addPublishingSlot() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const slot = createPublishingSlot(campaign, {
    platform: elements.schedulePlatform.value,
    date: elements.scheduleDate.value,
    time: elements.scheduleTime.value,
    status: elements.scheduleStatus.value,
    notes: elements.scheduleNotes.value.trim() || "Manual publishing slot."
  });
  campaign.publishing.schedule.push(slot);
  campaign.publishing.status = "calendar-drafted";
  addAgentActivity("Publishing control", `Added ${slot.platform} publishing slot for ${campaign.name}.`, campaign.id);
  render();
  showToast("Publishing slot added");
}

function cyclePublishingSlotStatus(slotId) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const slot = campaign.publishing.schedule.find((item) => item.id === slotId);
  if (!slot) return;
  const statuses = ["draft", "ready", "scheduled", "published"];
  const nextIndex = (statuses.indexOf(slot.status) + 1) % statuses.length;
  slot.status = statuses[nextIndex] || "draft";
  campaign.publishing.status = slot.status === "published" ? "published" : "calendar-drafted";
  addAgentActivity("Publishing control", `Moved ${slot.platform} slot to ${formatStatus(slot.status)}.`, campaign.id);
  render();
}

function deletePublishingSlot(slotId) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  campaign.publishing.schedule = campaign.publishing.schedule.filter((slot) => slot.id !== slotId);
  addAgentActivity("Publishing control", `Removed a publishing slot from ${campaign.name}.`, campaign.id);
  render();
  showToast("Publishing slot removed");
}

function focusPublishingSlot(slotId) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const slot = campaign.publishing.schedule.find((item) => item.id === slotId);
  if (!slot) return;
  elements.schedulePlatform.value = slot.platform;
  elements.scheduleDate.value = slot.date;
  elements.scheduleTime.value = slot.time;
  elements.scheduleStatus.value = slot.status;
  elements.scheduleNotes.value = slot.notes || "";
  const card = document.querySelector(`[data-slot-card="${CSS.escape(slotId)}"]`);
  if (card) highlightCommandCenterTarget(`[data-slot-card="${CSS.escape(slotId)}"]`);
}

function addCollaborationThread() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const note = elements.collaborationNote.value.trim();
  if (!note) {
    showToast("Add a thread note first");
    elements.collaborationNote.focus();
    return;
  }
  const thread = createCollaborationThread({
    sectionId: elements.collaborationSection.value,
    author: elements.collaboratorName.value.trim() || campaign.owner || "Creator",
    role: elements.collaboratorRole.value,
    mentions: elements.collaborationMentions.value.trim(),
    status: elements.collaborationStatus.value,
    note
  });
  campaign.collaborationThreads.unshift(thread);
  addAgentActivity(
    "Team collaboration",
    `${thread.author} added a ${formatStatus(thread.status).toLowerCase()} thread for ${thread.sectionName}.`,
    campaign.id
  );
  elements.collaborationNote.value = "";
  elements.collaborationMentions.value = "";
  elements.collaborationStatus.value = "open";
  render();
  showToast("Collaboration thread added");
}

function setCollaborationThreadStatus(threadId, status) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const thread = (campaign.collaborationThreads || []).find((item) => item.id === threadId);
  if (!thread) return;
  thread.status = status;
  thread.resolvedAt = status === "resolved" ? new Date().toISOString() : "";
  addAgentActivity(
    "Team collaboration",
    `${thread.sectionName} thread marked ${formatStatus(status).toLowerCase()}.`,
    campaign.id
  );
  render();
  showToast(status === "resolved" ? "Thread resolved" : "Thread reopened");
}

function resolveNextCollaborationThread() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const thread = (campaign.collaborationThreads || []).find((item) => item.status !== "resolved");
  if (!thread) {
    showToast("No active collaboration threads");
    return;
  }
  setCollaborationThreadStatus(thread.id, "resolved");
}

function focusCollaborationThread(threadId) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const thread = (campaign.collaborationThreads || []).find((item) => item.id === threadId);
  if (!thread) return;
  selectedReviewSectionId = thread.sectionId;
  elements.collaborationSection.value = thread.sectionId;
  render();
  highlightCommandCenterTarget(reviewSectionTargets[thread.sectionId] || "#campaign-overview");
}

function getAgentOps(campaign) {
  if (!campaign.agentOps) campaign.agentOps = createAgentOps(campaign);
  return campaign.agentOps;
}

function applyAgentAction(actionId) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const ops = getAgentOps(campaign);
  const now = new Date().toISOString();

  if (actionId === "run-signal-sweep") {
    const score = Math.min(96, 46 + ops.performanceSignals.length * 9 + campaign.scenes.length * 4);
    ops.performanceSignals.unshift({
      id: makeId(),
      source: "Performance Intelligence Agent",
      signal:
        "Signal sweep found audience questions, retention hooks, comment themes, and live-response moments to monitor after publish.",
      score,
      createdAt: now
    });
    ops.tasks.unshift(createAgentTask("Performance Intelligence Agent", "Analyze public response and score viral lift potential.", "running"));
    addAgentActivity("Performance Intelligence", `Ran signal sweep for ${campaign.name}; viral lift score moved to ${score}.`, campaign.id);
  }

  if (actionId === "queue-repurpose-plan") {
    const profile = getBrandProfile(campaign.brand);
    ops.repurposeCandidates.unshift({
      id: makeId(),
      format: "Short-form derivative pack",
      idea: `Create 5 follow-up shorts from ${campaign.brand}'s strongest before-and-after moment, using ${profile?.perspective || "the brand cinematic perspective"}.`,
      source: "Repurposing Agent",
      status: "candidate",
      createdAt: now
    });
    ops.tasks.unshift(createAgentTask("Repurposing Agent", "Draft hooks, captions, and clip instructions for top-performing moments.", "pending"));
    addAgentActivity("Repurposing", `Queued derivative content plan for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "capture-live-clip") {
    ops.restream.status = ops.restream.status === "not-scheduled" ? "clip-monitoring" : ops.restream.status;
    ops.restream.clipCandidates.unshift({
      id: makeId(),
      title: `Live clip candidate ${ops.restream.clipCandidates.length + 1}`,
      reason: "Restream live-response monitor flagged this as a potential viral clip moment for rapid repurpose.",
      status: "needs-review",
      createdAt: now
    });
    ops.performanceSignals.unshift({
      id: makeId(),
      source: "Restream Live Broadcast Agent",
      signal: "Live clip candidate captured and routed into the repurpose queue.",
      score: 72,
      createdAt: now
    });
    addAgentActivity("Restream", `Captured live clip candidate for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "draft-descript-plan") {
    ops.descript.status = "ready-for-edit";
    ops.descript.projectRef = ops.descript.projectRef || `Descript/${campaign.brand}/${campaign.name}`;
    ops.descript.editPlan = [
      "Use Descript to stitch approved clips and clean audio.",
      "Mine transcript moments for short-form derivatives, quote clips, avatar reads, and follow-up hooks.",
      "Export enhanced video/audio references back into Bunny and the publishing package."
    ].join(" ");
    ops.tasks.unshift(createAgentTask("Descript Editorial Agent", "Prepare transcript-aware edit plan and enhanced asset handoff.", "running"));
    addAgentActivity("Descript", `Drafted Descript enhancement plan for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "request-human-approval") {
    ops.approvals.unshift({
      id: makeId(),
      label: "Approve next automated publish, live, or repurpose action",
      status: "required",
      createdAt: now
    });
    addAgentActivity("Approval", `Requested human approval for next agentic action on ${campaign.name}.`, campaign.id);
  }

  if (actionId === "advance-agent-task") {
    const task = ops.tasks.find((item) => item.status !== "completed");
    if (!task) {
      showToast("No open agent tasks");
      return;
    }
    task.status = task.status === "pending" ? "running" : "completed";
    addAgentActivity("Agent task", `${task.agent} advanced: ${task.action}`, campaign.id);
  }

  if (actionId === "promote-repurpose-candidate") {
    const candidate = ops.repurposeCandidates.find((item) => item.status !== "promoted");
    if (!candidate) {
      showToast("No repurpose candidate to promote");
      return;
    }
    candidate.status = "promoted";
    ops.tasks.unshift(createAgentTask("Publishing Agent", `Package promoted repurpose asset: ${candidate.format}.`, "pending"));
    addAgentActivity("Repurposing", `Promoted repurpose candidate for ${campaign.name}.`, campaign.id);
  }

  if (actionId === "approve-next-agent-action") {
    const approval = ops.approvals.find((item) => item.status !== "approved");
    if (!approval) {
      showToast("No approval holds");
      return;
    }
    approval.status = "approved";
    addAgentActivity("Approval", `Approved control gate: ${approval.label}.`, campaign.id);
  }

  render();
  showToast("Agent operation applied");
}

function getManifest(campaign) {
  return {
    brand: campaign.brand,
    brandProfile: getBrandProfile(campaign.brand),
    campaign: campaign.name,
    platform: campaign.platform,
    quantity: campaign.quantity,
    dueDate: campaign.dueDate,
    owner: campaign.owner,
    readiness: getReadiness(campaign),
    elevenLabs: campaign.elevenLabs,
    remotion: campaign.remotion,
    bunny: campaign.assets,
    publishing: campaign.publishing,
    creativeDirection: campaign.creativeDirection,
    creativeDirectionVersions: campaign.creativeDirectionVersions,
    scenes: campaign.scenes,
    approvals: campaign.approvals,
    agentOps: campaign.agentOps,
    collaborationThreads: campaign.collaborationThreads || [],
    reviewRequests: getCampaignReviewRequests(campaign),
    agentActivity: (state.agentActivity || []).filter((item) => !item.campaignId || item.campaignId === campaign.id),
    stages: campaign.stages.map((stage, index) => ({
      name: stageTemplates[index].name,
      status: stage.status,
      owner: stage.owner,
      dueDate: stage.dueDate,
      checks: stage.checks
    }))
  };
}

function buildReviewPayload() {
  const campaign = getSelectedCampaign();
  if (!campaign) return null;
  const section = getActiveReviewSection();
  const reviewer = elements.reviewerName.value.trim();
  const priority = elements.reviewPriority.value;
  const comment = elements.reviewComment.value.trim();
  if (!comment) return null;
  const request = {
    id: makeId(),
    campaignId: campaign.id,
    campaignName: campaign.name,
    sectionId: section.id,
    sectionName: section.name,
    reviewer,
    priority,
    comment,
    createdAt: new Date().toISOString()
  };
  request.issueUrl = getGitHubIssueUrl(campaign, request);
  return request;
}

function getGitHubIssueUrl(campaign, request) {
  const stage = stageTemplates[selectedStageIndex];
  const title = `[Improvement] ${request.sectionName}: ${campaign.name}`;
  const body = [
    `Campaign: ${campaign.name}`,
    `Brand: ${campaign.brand}`,
    `Section: ${request.sectionName}`,
    `Current stage: ${stage?.name || "N/A"}`,
    `Priority: ${request.priority}`,
    `Reviewer: ${request.reviewer || "Unspecified"}`,
    "",
    "Improvement request:",
    request.comment,
    "",
    "Context:",
    `Readiness: ${getReadiness(campaign)}%`,
    `Bunny folder: ${campaign.assets.bunnyFolder || "Not set"}`
  ].join("\n");
  const url = new URL(`https://github.com/${githubRepoFullName}/issues/new`);
  url.searchParams.set("title", title);
  url.searchParams.set("body", body);
  return url.toString();
}

function getPublishingPackage(campaign) {
  return {
    campaign: campaign.name,
    approvedMediaUrl: campaign.assets.video,
    thumbnailUrl: campaign.assets.thumbnail,
    voiceoverUrl: campaign.assets.voiceover || campaign.elevenLabs.voiceoverUrl,
    voiceProfile: campaign.elevenLabs.voiceProfile,
    remotionOutputUrl: campaign.assets.remotionOutput || campaign.remotion.outputUrl,
    caption: campaign.publishing.caption,
    hashtags: campaign.publishing.hashtags,
    platformNotes: campaign.publishing.platformNotes,
    publishingStatus: campaign.publishing.status,
    schedule: campaign.publishing.schedule,
    bunnyFolder: campaign.assets.bunnyFolder
  };
}

function getElevenLabsBrief(campaign) {
  return {
    campaign: campaign.name,
    brand: campaign.brand,
    accountLogin: campaign.elevenLabs.accountLogin,
    apiStatus: campaign.elevenLabs.apiStatus,
    voiceProfile: campaign.elevenLabs.voiceProfile,
    scriptUrl: campaign.elevenLabs.scriptUrl || campaign.assets.voiceScript,
    voiceoverUrl: campaign.elevenLabs.voiceoverUrl || campaign.assets.voiceover,
    complianceGuardrails: campaign.guardrails,
    scenes: campaign.scenes.map((scene) => ({
      title: scene.title,
      script: scene.script,
      prompt: scene.prompt,
      compliance: scene.compliance,
      status: scene.status
    })),
    notes: campaign.elevenLabs.notes
  };
}

function getRemotionBrief(campaign) {
  return {
    campaign: campaign.name,
    brand: campaign.brand,
    sourceScriptUrl: campaign.elevenLabs.scriptUrl || campaign.assets.voiceScript,
    sourceAudioUrl:
      campaign.remotion.sourceAudioUrl || campaign.elevenLabs.voiceoverUrl || campaign.assets.voiceover,
    remotionOutputUrl: campaign.remotion.outputUrl || campaign.assets.remotionOutput,
    scenes: campaign.scenes.map((scene) => ({
      title: scene.title,
      script: scene.script,
      prompt: scene.prompt,
      compliance: scene.compliance,
      status: scene.status
    })),
    notes: campaign.remotion.compositionNotes
  };
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied`);
  } catch (error) {
    showToast(`${label} ready in export`);
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 2600);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.querySelector("#openCampaignForm").addEventListener("click", openCampaignDialog);

document.querySelector("[data-action='new-campaign']").addEventListener("click", openCampaignDialog);

document.querySelector("#openBrandManager").addEventListener("click", () => {
  openBrandDialog();
});

document.querySelector("#seedWorkspace").addEventListener("click", () => {
  state = {
    brandProfiles: cloneDefaultBrandProfiles(),
    campaigns: defaultCampaigns.map(normalizeCampaign),
    selectedCampaignId: "",
    selectedStageIndex: 0,
    selectedReviewSectionId: reviewSections[0].id,
    agentActivity: [
      {
        id: makeId(),
        type: "System",
        message: "Demo workspace reset with default brand profiles and production workflow.",
        createdAt: new Date().toISOString()
      }
    ]
  };
  selectedCampaignId = state.campaigns[0]?.id || "";
  selectedStageIndex = 0;
  selectedReviewSectionId = reviewSections[0].id;
  render();
  showToast("Demo workspace reset");
});

document.querySelector("#exportWorkspace").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ota-content-command-center-workspace.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

if (elements.reviewSectionButtons) {
  elements.reviewSectionButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-section]");
    if (!button) return;
    selectedReviewSectionId = button.dataset.reviewSection;
    render();
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".review-jump");
  if (!button) return;
  selectedReviewSectionId = button.dataset.reviewSection || reviewSections[0].id;
  window.location.href = getEnhancementIdeaUrl(selectedReviewSectionId);
});

elements.commandSectionNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-jump-target]");
  if (!button) return;
  highlightCommandCenterTarget(button.dataset.jumpTarget);
});

document.querySelector("#copyReviewRequest")?.addEventListener("click", () => {
  const request = buildReviewPayload();
  if (!request) {
    showToast("Add an improvement request first");
    return;
  }
  copyText(
    JSON.stringify(
      {
        campaign: request.campaignName,
        section: request.sectionName,
        priority: request.priority,
        reviewer: request.reviewer,
        comment: request.comment,
        githubIssueDraft: request.issueUrl
      },
      null,
      2
    ),
    "Review request"
  );
});

document.querySelector("#openGithubIssue")?.addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  const request = buildReviewPayload();
  if (!campaign || !request) {
    showToast("Add an improvement request first");
    return;
  }
  campaign.reviewRequests.unshift(request);
  elements.reviewComment.value = "";
  window.open(request.issueUrl, "_blank", "noopener");
  render();
  showToast("GitHub issue draft opened");
});

elements.campaignForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(elements.campaignForm));
  data.brand = getCampaignFormBrandName();
  if (!isRegulatedBrand(data.brand)) data.guardrails = "";
  if (data.brand && !getBrandProfile(data.brand)) {
    state.brandProfiles.push({
      id: makeId(),
      name: data.brand,
      regulated: false,
      voice: "",
      audience: "",
      offers: "",
      perspective:
        "brand-native point of view, cinematic texture, clear emotional stakes, and repeatable visual language",
      guardrails: "",
      platforms: data.platform
    });
    addAgentActivity("Brand strategy", `Created new brand profile shell for ${data.brand}.`);
  }
  const campaign = createCampaign(data);
  state.campaigns.unshift(campaign);
  selectedCampaignId = campaign.id;
  selectedStageIndex = 0;
  addAgentActivity(
    "Campaign setup",
    `Created ${campaign.name} for ${campaign.brand} with an agentic creative direction draft.`,
    campaign.id
  );
  elements.campaignDialog.close();
  render();
  showToast("Campaign launched");
});

elements.campaignBrandSelect.addEventListener("change", () => {
  syncCampaignSetupFields();
  if (!elements.customBrandField.hidden) elements.customBrandName.focus();
});

elements.customBrandName.addEventListener("input", () => {
  syncCampaignSetupFields();
});

["name", "platform", "quantity"].forEach((fieldName) => {
  getCampaignFormField(fieldName).addEventListener("input", () => {
    syncCampaignSetupFields();
  });
});

getCampaignFormField("creativeDirection").addEventListener("input", () => {
  creativeDirectionTouched = true;
  renderCampaignDialogCoPilot();
});

getCampaignFormField("guardrails").addEventListener("input", () => {
  getCampaignFormField("guardrails").dataset.generated = "false";
  renderCampaignDialogCoPilot();
});

["dueDate", "owner"].forEach((fieldName) => {
  getCampaignFormField(fieldName).addEventListener("input", () => {
    renderCampaignDialogCoPilot();
  });
});

elements.generateCreativeDirection.addEventListener("click", () => {
  syncCampaignSetupFields({ forceCreative: true });
  getCampaignFormField("creativeDirection").focus();
});

elements.brandProfileSelect.addEventListener("change", () => {
  loadBrandProfileForm();
  renderBrandDialogCoPilot();
});

elements.newBrandProfile.addEventListener("click", () => {
  elements.brandProfileForm.reset();
  elements.brandProfileSelect.value = "";
  renderBrandDialogCoPilot();
  getBrandFormField("name").focus();
});

elements.brandProfileForm.addEventListener("input", () => {
  renderBrandDialogCoPilot();
});

elements.brandProfileForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(elements.brandProfileForm));
  const existingId = elements.brandProfileSelect.value;
  const profile = {
    id: existingId || makeId(),
    name: data.name.trim(),
    regulated: getBrandFormField("regulated").checked,
    voice: data.voice.trim(),
    audience: data.audience.trim(),
    offers: data.offers.trim(),
    perspective: data.perspective.trim(),
    guardrails: data.guardrails.trim(),
    platforms: data.platforms.trim()
  };
  if (!profile.name || !profile.perspective) {
    showToast("Brand name and perspective are required");
    return;
  }
  const existingIndex = state.brandProfiles.findIndex((brand) => brand.id === profile.id);
  if (existingIndex >= 0) {
    state.brandProfiles[existingIndex] = profile;
  } else {
    state.brandProfiles.push(profile);
  }
  addAgentActivity("Brand strategy", `Saved brand profile for ${profile.name}.`);
  elements.brandDialog.close();
  render();
  showToast("Brand profile saved");
});

elements.editActiveBrand.addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  openBrandDialog(campaign?.brand);
});

elements.regenerateCampaignDirection.addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const draft = buildCreativeDirectionDraft(campaign);
  const version = createCreativeDirectionVersion(draft, "Regenerated campaign direction");
  campaign.creativeDirection = draft;
  campaign.creativeDirectionVersions.push(version);
  campaign.stages[0].checks[1].done = true;
  addAgentActivity("Creative direction", `Regenerated creative direction for ${campaign.name}.`, campaign.id);
  render();
  showToast("Creative direction regenerated");
});

elements.creativeDirectionVersions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-use-direction]");
  const campaign = getSelectedCampaign();
  if (!button || !campaign) return;
  const version = campaign.creativeDirectionVersions.find((item) => item.id === button.dataset.useDirection);
  if (!version) return;
  campaign.creativeDirection = version.value;
  addAgentActivity("Creative direction", `Activated a previous creative direction for ${campaign.name}.`, campaign.id);
  render();
  showToast("Creative direction activated");
});

elements.sceneForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const data = Object.fromEntries(new FormData(elements.sceneForm));
  campaign.scenes.push({
    id: makeId(),
    title: data.title.trim(),
    script: data.script.trim(),
    prompt: data.prompt.trim(),
    compliance: data.compliance.trim(),
    status: "not-started"
  });
  campaign.stages[1].checks[0].done = true;
  campaign.stages[1].checks[1].done = true;
  campaign.stages[1].checks[3].done = true;
  addAgentActivity("Scene planning", `Added scripted scene "${data.title.trim()}" to ${campaign.name}.`, campaign.id);
  elements.sceneForm.reset();
  elements.sceneDialog.close();
  render();
  showToast("Scene added");
});

elements.sceneForm.addEventListener("input", () => {
  renderSceneDialogCoPilot();
});

elements.campaignSearch.addEventListener("input", renderCampaignList);
elements.stageFilter.addEventListener("change", renderCampaignList);

elements.campaignList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-campaign-id]");
  if (!button) return;
  selectedCampaignId = button.dataset.campaignId;
  selectedStageIndex = 0;
  render();
});

elements.stageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedStageIndex = Number(tab.dataset.stageIndex);
    render();
  });
});

elements.stageStatus.addEventListener("change", (event) => {
  updateStageField("status", event.target.value);
});

elements.stageOwner.addEventListener("input", (event) => {
  updateStageField("owner", event.target.value);
});

elements.stageDue.addEventListener("input", (event) => {
  updateStageField("dueDate", event.target.value);
});

elements.stageNotes.addEventListener("input", (event) => {
  updateStageField("notes", event.target.value);
});

elements.stageChecklist.addEventListener("change", (event) => {
  const campaign = getSelectedCampaign();
  const index = Number(event.target.dataset.checkIndex);
  if (!campaign || Number.isNaN(index)) return;
  const stage = campaign.stages[selectedStageIndex];
  stage.checks[index].done = event.target.checked;
  autoApproveStage(stage);
  render();
});

elements.coPilotActions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-copilot-action]");
  if (!button) return;
  applyCoPilotAction(button.dataset.copilotAction);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dialog-copilot-action]");
  if (!button) return;
  applyDialogCoPilotAction(button.dataset.dialogCopilotAction);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-agent-action]");
  if (!button) return;
  applyAgentAction(button.dataset.agentAction);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.target?.id !== "brandCoPilotPrompt") return;
  event.preventDefault();
  answerBrandCoPilotPrompt();
});

document.querySelector("#addScene").addEventListener("click", () => {
  elements.sceneForm.reset();
  renderSceneDialogCoPilot();
  elements.sceneDialog.showModal();
});

elements.sceneList.addEventListener("click", (event) => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const statusButton = event.target.closest("[data-scene-status]");
  const deleteButton = event.target.closest("[data-delete-scene]");

  if (statusButton) {
    const scene = campaign.scenes.find((item) => item.id === statusButton.dataset.sceneId);
    if (scene) scene.status = statusButton.dataset.sceneStatus;
  }

  if (deleteButton) {
    campaign.scenes = campaign.scenes.filter((item) => item.id !== deleteButton.dataset.deleteScene);
  }

  render();
});

elements.approvalChecks.addEventListener("change", (event) => {
  const campaign = getSelectedCampaign();
  const index = Number(event.target.dataset.approvalIndex);
  if (!campaign || Number.isNaN(index)) return;
  campaign.approvals[index].done = event.target.checked;
  render();
});

[
  ["bunnyFolder", "bunnyFolder"],
  ["assetVideo", "video"],
  ["assetThumbnail", "thumbnail"],
  ["assetVoiceover", "voiceover"],
  ["assetVoiceScript", "voiceScript"],
  ["assetRemotionOutput", "remotionOutput"],
  ["assetCaptionDoc", "captionDoc"],
  ["assetScenes", "scenes"],
  ["assetApprovalDoc", "approvalDoc"]
].forEach(([elementKey, assetKey]) => {
  elements[elementKey].addEventListener("input", (event) => {
    const campaign = getSelectedCampaign();
    if (!campaign) return;
    campaign.assets[assetKey] = event.target.value;
    if (assetKey === "voiceScript") campaign.elevenLabs.scriptUrl = event.target.value;
    if (assetKey === "voiceover") {
      campaign.elevenLabs.voiceoverUrl = event.target.value;
      campaign.remotion.sourceAudioUrl = event.target.value;
    }
    if (assetKey === "remotionOutput") campaign.remotion.outputUrl = event.target.value;
    render();
  });
});

[
  ["elevenLabsAccount", "accountLogin"],
  ["elevenLabsStatus", "apiStatus"],
  ["elevenLabsVoice", "voiceProfile"],
  ["elevenLabsScriptUrl", "scriptUrl"],
  ["elevenLabsAudioUrl", "voiceoverUrl"],
  ["elevenLabsNotes", "notes"]
].forEach(([elementKey, elevenLabsKey]) => {
  elements[elementKey].addEventListener("input", (event) => {
    const campaign = getSelectedCampaign();
    if (!campaign) return;
    campaign.elevenLabs[elevenLabsKey] = event.target.value;
    if (elevenLabsKey === "scriptUrl") campaign.assets.voiceScript = event.target.value;
    if (elevenLabsKey === "voiceoverUrl") {
      campaign.assets.voiceover = event.target.value;
      campaign.remotion.sourceAudioUrl = event.target.value;
    }
    render();
  });
});

[
  ["remotionSourceAudio", "sourceAudioUrl"],
  ["remotionOutputUrl", "outputUrl"],
  ["remotionNotes", "compositionNotes"]
].forEach(([elementKey, remotionKey]) => {
  elements[elementKey].addEventListener("input", (event) => {
    const campaign = getSelectedCampaign();
    if (!campaign) return;
    campaign.remotion[remotionKey] = event.target.value;
    if (remotionKey === "outputUrl") campaign.assets.remotionOutput = event.target.value;
    render();
  });
});

[
  ["captionText", "caption"],
  ["hashtags", "hashtags"],
  ["platformNotes", "platformNotes"]
].forEach(([elementKey, publishingKey]) => {
  elements[elementKey].addEventListener("input", (event) => {
    const campaign = getSelectedCampaign();
    if (!campaign) return;
    campaign.publishing[publishingKey] = event.target.value;
    render();
  });
});

document.querySelector("#seedPublishingSchedule").addEventListener("click", seedPublishingSchedule);
document.querySelector("#addPublishingSlot").addEventListener("click", addPublishingSlot);
document.querySelector("#addCollaborationThread").addEventListener("click", addCollaborationThread);
document.querySelector("#resolveNextCollaborationThread").addEventListener("click", resolveNextCollaborationThread);

elements.publishingCalendarGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-focus-slot]");
  if (!button) return;
  focusPublishingSlot(button.dataset.focusSlot);
});

elements.publishingScheduleList.addEventListener("click", (event) => {
  const advanceButton = event.target.closest("[data-cycle-schedule-status]");
  const deleteButton = event.target.closest("[data-delete-schedule-slot]");
  if (advanceButton) {
    cyclePublishingSlotStatus(advanceButton.dataset.cycleScheduleStatus);
    return;
  }
  if (deleteButton) {
    deletePublishingSlot(deleteButton.dataset.deleteScheduleSlot);
  }
});

elements.collaborationThreadList.addEventListener("click", (event) => {
  const focusButton = event.target.closest("[data-thread-focus]");
  const toggleButton = event.target.closest("[data-thread-toggle]");
  if (focusButton) {
    focusCollaborationThread(focusButton.dataset.threadFocus);
    return;
  }
  if (toggleButton) {
    const threadId = toggleButton.dataset.threadToggle;
    const campaign = getSelectedCampaign();
    const thread = campaign?.collaborationThreads?.find((item) => item.id === threadId);
    if (!thread) return;
    setCollaborationThreadStatus(threadId, thread.status === "resolved" ? "open" : "resolved");
  }
});

document.querySelector("#copyBunnyManifest").addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  copyText(JSON.stringify(getManifest(campaign), null, 2), "Bunny manifest");
});

elements.copyActivityLog.addEventListener("click", () => {
  copyText(JSON.stringify(state.agentActivity || [], null, 2), "Activity log");
});

document.querySelector("#copyElevenLabsBrief").addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  copyText(JSON.stringify(getElevenLabsBrief(campaign), null, 2), "ElevenLabs brief");
});

document.querySelector("#copyRemotionBrief").addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  copyText(JSON.stringify(getRemotionBrief(campaign), null, 2), "Remotion brief");
});

document.querySelector("#copyPublishingPackage").addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  copyText(JSON.stringify(getPublishingPackage(campaign), null, 2), "Publishing package");
});

function highlightCommandCenterTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.classList.remove("deep-link-highlight");
  requestAnimationFrame(() => {
    target.classList.add("deep-link-highlight");
  });
  window.setTimeout(() => {
    target.classList.remove("deep-link-highlight");
  }, 3000);
}

function showTutorialReturnLink() {
  const params = new URLSearchParams(window.location.search);
  const returnTarget = params.get("tutorialReturn");
  if (!returnTarget) return;
  const safeTarget = returnTarget.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeTarget) return;
  const returnHref = `./command-center-tutorial.html#${safeTarget}`;
  const tutorialNavLink = document.querySelector('a[href="./command-center-tutorial.html"]');
  if (tutorialNavLink) {
    tutorialNavLink.href = returnHref;
    tutorialNavLink.title = "Return to the tutorial section you opened from";
  }
  const existingLink = document.querySelector("#tutorialReturnLink");
  if (existingLink) existingLink.remove();
  const link = document.createElement("a");
  link.id = "tutorialReturnLink";
  link.className = "tutorial-return-link";
  link.href = returnHref;
  link.textContent = "Back to tutorial section";
  document.body.appendChild(link);
}

function handleCommandCenterHash() {
  const hash = window.location.hash;
  const targetMap = {
    "#command-topbar": { selector: "#command-topbar" },
    "#campaign-queue": { selector: "#campaign-queue" },
    "#campaign-overview": { selector: "#campaign-overview" },
    "#active-brand-profile": { selector: "#active-brand-profile" },
    "#brand-profile-manager": { open: () => openBrandDialog(getSelectedCampaign()?.brand), selector: "#brandDialog" },
    "#launch-workstream": { open: openCampaignDialog, selector: "#campaignDialog" },
    "#creative-direction": { selector: "#creative-direction" },
    "#creator-preview-studio": { selector: "#creator-preview-studio" },
    "#ota-copilot": { selector: "#ota-copilot" },
    "#review-lane": { selector: "#enhancement-idea-section" },
    "#reviewPanel": { selector: "#enhancement-idea-section" },
    "#enhancement-idea-section": { selector: "#enhancement-idea-section" },
    "#team-collaboration-section": { selector: "#team-collaboration-section" },
    "#workflow-stage-rail": { selector: "#workflow-stage-rail" },
    "#scene-queue-section": { selector: "#scene-queue-section" },
    "#add-scene-workflow": {
      open: () => {
        elements.sceneForm.reset();
        renderSceneDialogCoPilot();
        elements.sceneDialog.showModal();
      },
      selector: "#sceneDialog"
    },
    "#elevenlabs-audio-section": { selector: "#elevenlabs-audio-section" },
    "#remotion-pass-section": { selector: "#remotion-pass-section" },
    "#stage-higgsfield": { stageIndex: 4, selector: "#workflow-stage-panel" },
    "#approval-gate-section": { selector: "#approval-gate-section" },
    "#bunny-storage-section": { selector: "#bunny-storage-section" },
    "#publishing-package-section": { selector: "#publishing-package-section" },
    "#publishing-calendar-section": { selector: "#publishing-calendar-section" },
    "#activity-log-section": { selector: "#activity-log-section" },
    "#agent-operations-layer": { selector: "#agent-operations-layer" }
  };
  const target = targetMap[hash];
  if (!target) return;
  if (Number.isInteger(target.stageIndex)) {
    selectedStageIndex = target.stageIndex;
    render();
  }
  if (target.open) {
    target.open();
    window.setTimeout(() => highlightCommandCenterTarget(target.selector), 80);
    return;
  }
  highlightCommandCenterTarget(target.selector);
}

if (!selectedCampaignId && state.campaigns[0]) {
  selectedCampaignId = state.campaigns[0].id;
}

renderBrandOptions();
render();
showTutorialReturnLink();
handleCommandCenterHash();
window.addEventListener("hashchange", handleCommandCenterHash);
