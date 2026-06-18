const storageKey = "ota-content-command-center-v1";

let state = loadState();
let selectedCampaignId = state.selectedCampaignId || state.campaigns[0]?.id || "";
let activeAgentRuns = {};

const elements = {
  launchCampaignSelect: document.querySelector("#launchCampaignSelect"),
  viralLaunchStatus: document.querySelector("#viralLaunchStatus"),
  viralLaunchScoreboard: document.querySelector("#viralLaunchScoreboard"),
  agenticLaunchSummary: document.querySelector("#agenticLaunchSummary"),
  agentProgressPanel: document.querySelector("#agentProgressPanel"),
  viralLaunchCandidate: document.querySelector("#viralLaunchCandidate"),
  viralLaunchCandidatePreview: document.querySelector("#viralLaunchCandidatePreview"),
  viralLaunchChecklist: document.querySelector("#viralLaunchChecklist"),
  scoreViralLaunch: document.querySelector("#scoreViralLaunch"),
  runLaunchAgent: document.querySelector("#runLaunchAgent"),
  markManualLaunchReady: document.querySelector("#markManualLaunchReady"),
  copyViralLaunchPack: document.querySelector("#copyViralLaunchPack"),
  toast: document.querySelector("#toast")
};

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
    parsed.campaigns = Array.isArray(parsed.campaigns) ? parsed.campaigns : [];
    parsed.brandProfiles = Array.isArray(parsed.brandProfiles) ? parsed.brandProfiles : [];
    parsed.agentActivity = Array.isArray(parsed.agentActivity) ? parsed.agentActivity : [];
    parsed.campaigns.forEach(normalizeCampaign);
    return parsed;
  } catch (error) {
    return { campaigns: [], brandProfiles: [], agentActivity: [] };
  }
}

function normalizeCampaign(campaign) {
  campaign.scenes = Array.isArray(campaign.scenes) ? campaign.scenes : [];
  campaign.assets = campaign.assets || {};
  campaign.elevenLabs = campaign.elevenLabs || {};
  campaign.remotion = campaign.remotion || {};
  campaign.agentOps = campaign.agentOps || {};
  campaign.agentOps.tasks = Array.isArray(campaign.agentOps.tasks) ? campaign.agentOps.tasks : [];
  campaign.publishing = {
    caption: campaign.publishing?.caption || "",
    hashtags: campaign.publishing?.hashtags || "",
    platformNotes: campaign.publishing?.platformNotes || "",
    status: campaign.publishing?.status || "not-ready",
    schedule: Array.isArray(campaign.publishing?.schedule) ? campaign.publishing.schedule : []
  };
  campaign.approvals = Array.isArray(campaign.approvals) ? campaign.approvals : [];
  campaign.viralLaunch = createViralLaunchState(campaign.viralLaunch || {});
}

function saveState() {
  state.selectedCampaignId = selectedCampaignId;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function makeId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createViralLaunchState(seed = {}) {
  return {
    selectedSceneId: seed.selectedSceneId || "",
    score: Number(seed.score || 0),
    status: seed.status || "draft",
    lastScoredAt: seed.lastScoredAt || "",
    launchNotes: seed.launchNotes || "",
    agentHandledGates: seed.agentHandledGates || {},
    agentSummary: seed.agentSummary || ""
  };
}

const gateAgentWorkflows = {
  hook: [
    "Reading selected script and brand perspective",
    "Identifying missing tension or contrast",
    "Rewriting the opening hook",
    "Re-scoring launch readiness"
  ],
  script: [
    "Inspecting launch candidate scene",
    "Drafting voiceover-ready script spine",
    "Saving script to campaign workspace",
    "Re-scoring launch readiness"
  ],
  prompt: [
    "Reading script and cinematic perspective",
    "Drafting visual prompt around the story",
    "Saving prompt to launch candidate",
    "Re-scoring launch readiness"
  ],
  audio: [
    "Packaging script for ElevenLabs",
    "Selecting launch narrator context",
    "Queuing Audio Agent handoff",
    "Waiting on returned audio URL"
  ],
  media: [
    "Packaging scene for Remotion and Higgsfield",
    "Preparing production notes",
    "Queuing media generation handoff",
    "Waiting on returned media URL"
  ],
  caption: [
    "Reading hook and platform context",
    "Drafting caption and hashtags",
    "Saving publishing package notes",
    "Re-scoring launch readiness"
  ],
  calendar: [
    "Checking current publishing schedule",
    "Creating or selecting primary launch slot",
    "Marking slot as Ready",
    "Re-scoring launch readiness"
  ],
  approval: [
    "Checking brand regulation status",
    "Reviewing approval requirements",
    "Queuing approval agent if needed",
    "Updating launch hold status"
  ]
};

function getGateLabel(gateId) {
  const labels = {
    hook: "Hook Agent",
    script: "Script Agent",
    prompt: "Prompt Agent",
    audio: "Audio Agent",
    media: "Media Agent",
    caption: "Caption Agent",
    calendar: "Calendar Agent",
    approval: "Approval Agent"
  };
  return labels[gateId] || "Launch Agent";
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getSelectedCampaign() {
  return state.campaigns.find((campaign) => campaign.id === selectedCampaignId) || state.campaigns[0] || null;
}

function getBrandProfile(brandName) {
  const normalized = String(brandName || "").trim().toLowerCase();
  return state.brandProfiles.find((brand) => String(brand.name || "").toLowerCase() === normalized);
}

function isRegulatedBrand(brandName) {
  return Boolean(getBrandProfile(brandName)?.regulated);
}

function getCampaignPlatforms(campaign) {
  if (campaign.platform && campaign.platform !== "Multi-platform") return [campaign.platform];
  const fromProfile = (getBrandProfile(campaign.brand)?.platforms || "")
    .split(",")
    .map((platform) => platform.trim())
    .filter(Boolean);
  return fromProfile.length ? fromProfile : ["TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn"];
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

function getScheduleBaseDate(campaign) {
  const due = campaign.dueDate ? new Date(`${campaign.dueDate}T09:00:00`) : null;
  if (due && !Number.isNaN(due.getTime())) return due;
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  return today;
}

function createPublishingSlot(campaign, input = {}) {
  return {
    id: makeId(),
    platform: input.platform || getCampaignPlatforms(campaign)[0] || "Multi-platform",
    date: input.date || toDateInputValue(getScheduleBaseDate(campaign)),
    time: input.time || "09:00",
    status: input.status || "draft",
    notes: input.notes || "Ready for manual posting review once media and caption are approved."
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
      notes: index === 0 ? "Primary launch slot. Confirm final media before posting." : "Follow-up slot for platform-native variation."
    })
  );
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
  if (state.agentActivity.length > 100) state.agentActivity = state.agentActivity.slice(-100);
}

function renderAgentProgress() {
  const runs = Object.values(activeAgentRuns);
  if (!runs.length) {
    elements.agentProgressPanel.innerHTML = "";
    return;
  }

  elements.agentProgressPanel.innerHTML = runs
    .map(
      (run) => `
        <article class="agent-progress-card ${escapeHtml(run.status)}">
          <div>
            <strong>${escapeHtml(run.label)}</strong>
            <span>${escapeHtml(run.status === "complete" ? "Complete" : "Running")}</span>
          </div>
          <p>${escapeHtml(run.step)}</p>
          <div class="agent-progress-track" aria-label="${escapeHtml(run.label)} progress">
            <i style="width: ${Number(run.percent || 0)}%"></i>
          </div>
          <small>${Number(run.percent || 0)}% complete</small>
        </article>
      `
    )
    .join("");
}

function updateAgentProgress(gateId, update) {
  activeAgentRuns[gateId] = {
    gateId,
    label: getGateLabel(gateId),
    status: "running",
    percent: 0,
    step: "Starting agent",
    ...(activeAgentRuns[gateId] || {}),
    ...update
  };
  renderAgentProgress();
  renderViralLaunchControl();
}

function completeAgentProgress(gateId, step = "Agent handoff complete") {
  updateAgentProgress(gateId, {
    status: "complete",
    percent: 100,
    step
  });
}

function isGateAgentRunning(gateId) {
  return activeAgentRuns[gateId]?.status === "running";
}

function markAgentHandled(campaign, gateId, detail) {
  campaign.viralLaunch = createViralLaunchState(campaign.viralLaunch);
  campaign.viralLaunch.agentHandledGates[gateId] = {
    detail,
    handledAt: new Date().toISOString()
  };
  campaign.viralLaunch.agentSummary = detail;
}

function queueAgentTask(campaign, agent, action) {
  campaign.agentOps = campaign.agentOps || {};
  campaign.agentOps.tasks = Array.isArray(campaign.agentOps.tasks) ? campaign.agentOps.tasks : [];
  campaign.agentOps.tasks.unshift({
    id: makeId(),
    agent,
    action,
    status: "pending",
    createdAt: new Date().toISOString()
  });
}

function getBrandPerspective(campaign) {
  return (
    getBrandProfile(campaign.brand)?.perspective ||
    "brand-native point of view, cinematic texture, clear emotional stakes, and repeatable visual language"
  );
}

function buildAgentLaunchScript(campaign) {
  return `Hidden cost: ${campaign.brand} is showing what happens when ${campaign.name} stays stuck in the old workflow. The shift is simple: name the friction, reveal the clearer path, and give the audience one next action they can trust.`;
}

function buildAgentLaunchPrompt(campaign) {
  return `${getBrandPerspective(campaign)}, high-retention short-form launch candidate, clear before-and-after story, visible tension in the first frame, confident brand proof, clean lighting, platform-ready composition.`;
}

function getOrCreateLaunchScene(campaign) {
  let scene = getSelectedLaunchScene(campaign);
  if (scene) return scene;
  scene = {
    id: makeId(),
    title: "Agent Launch Candidate",
    script: buildAgentLaunchScript(campaign),
    prompt: buildAgentLaunchPrompt(campaign),
    compliance: isRegulatedBrand(campaign.brand) ? "Route final language through regulated-brand approval before publishing." : "",
    status: "in-progress"
  };
  campaign.scenes.push(scene);
  campaign.viralLaunch = createViralLaunchState(campaign.viralLaunch);
  campaign.viralLaunch.selectedSceneId = scene.id;
  return scene;
}

function strengthenLaunchHook(campaign) {
  const scene = getOrCreateLaunchScene(campaign);
  const current = String(scene.script || "").trim();
  const hook = `Hidden cost: ${campaign.brand} is exposing the moment ${campaign.name} stops being a content idea and starts becoming a sharper audience action.`;
  const rest = current.replace(/^[^.!?]+[.!?]?\s*/, "").trim();
  scene.script = rest ? `${hook} ${rest}` : `${hook} ${buildAgentLaunchScript(campaign)}`;
  scene.status = scene.status || "in-progress";
  markAgentHandled(campaign, "hook", "Launch Agent strengthened the opening hook with tension and contrast.");
}

function ensureLaunchScript(campaign) {
  const scene = getOrCreateLaunchScene(campaign);
  if (!scene.script?.trim()) scene.script = buildAgentLaunchScript(campaign);
  scene.status = scene.status || "in-progress";
  markAgentHandled(campaign, "script", "Launch Agent drafted script text for the selected launch candidate.");
}

function ensureLaunchPrompt(campaign) {
  const scene = getOrCreateLaunchScene(campaign);
  if (!scene.prompt?.trim()) scene.prompt = buildAgentLaunchPrompt(campaign);
  markAgentHandled(campaign, "prompt", "Launch Agent generated a cinematic visual prompt tied to the script.");
}

function queueAudioAgent(campaign) {
  const scene = getOrCreateLaunchScene(campaign);
  campaign.elevenLabs.voiceProfile = campaign.elevenLabs.voiceProfile || `${campaign.brand} launch narrator`;
  campaign.elevenLabs.notes = [
    campaign.elevenLabs.notes || "",
    `Launch Agent queued ElevenLabs narration for "${scene.title}" using the selected scene script.`,
    "Human must attach the generated audio URL before final publish."
  ]
    .filter(Boolean)
    .join("\n");
  queueAgentTask(campaign, "ElevenLabs Audio Agent", `Generate narration for launch candidate "${scene.title}" and return the audio URL.`);
  markAgentHandled(campaign, "audio", "Launch Agent queued ElevenLabs audio generation. Attach the returned audio URL to clear the gate.");
}

function queueMediaAgent(campaign) {
  const scene = getOrCreateLaunchScene(campaign);
  campaign.remotion.compositionNotes = [
    campaign.remotion.compositionNotes || "",
    `Launch Agent queued Remotion/Higgsfield production for "${scene.title}" with audio-led timing and platform-ready pacing.`,
    "Human must attach the final video or Remotion output URL before final publish."
  ]
    .filter(Boolean)
    .join("\n");
  queueAgentTask(campaign, "Remotion + Higgsfield Agent", `Produce the launch candidate media and return final/Remotion output URL for "${scene.title}".`);
  markAgentHandled(campaign, "media", "Launch Agent queued media production. Attach final video or Remotion output URL to clear the gate.");
}

function draftCaptionPackage(campaign) {
  const scene = getOrCreateLaunchScene(campaign);
  const hook = getLaunchHookText(scene) || `${campaign.brand} turns attention into action.`;
  campaign.publishing.caption =
    campaign.publishing.caption ||
    `${hook}\n\nThis is the moment to turn the idea into a publishable move. Watch the shift, then act on the clearer next step.`;
  campaign.publishing.hashtags =
    campaign.publishing.hashtags || "#OTASocialEngine #ContentEngine #AIMarketing #LaunchReady";
  campaign.publishing.platformNotes = [
    campaign.publishing.platformNotes || "",
    "Launch Agent drafted the caption package from the selected hook. Review final wording before publishing."
  ]
    .filter(Boolean)
    .join("\n");
  markAgentHandled(campaign, "caption", "Launch Agent drafted caption, hashtags, and platform notes for the selected candidate.");
}

function readyCalendarSlot(campaign) {
  if (!campaign.publishing.schedule.length) campaign.publishing.schedule = createSuggestedPublishingSchedule(campaign);
  const slot = campaign.publishing.schedule[0];
  slot.status = ["scheduled", "published"].includes(slot.status) ? slot.status : "ready";
  slot.notes = slot.notes || "Launch Agent marked this as the primary manual launch slot.";
  campaign.publishing.status = "manual-launch-slot-ready";
  markAgentHandled(campaign, "calendar", "Launch Agent created or marked the primary calendar slot as Ready.");
}

function queueApprovalAgent(campaign) {
  if (!isRegulatedBrand(campaign.brand)) {
    markAgentHandled(campaign, "approval", "Launch Agent confirmed standard-brand manual review path is visible.");
    return;
  }
  queueAgentTask(campaign, "Compliance Approval Agent", `Review regulated launch candidate for ${campaign.brand} before manual posting.`);
  markAgentHandled(campaign, "approval", "Launch Agent queued regulated approval review. Human approval must complete before final publish.");
}

function applyAgentGate(gateId) {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  if (gateId === "hook") strengthenLaunchHook(campaign);
  if (gateId === "script") ensureLaunchScript(campaign);
  if (gateId === "prompt") ensureLaunchPrompt(campaign);
  if (gateId === "audio") queueAudioAgent(campaign);
  if (gateId === "media") queueMediaAgent(campaign);
  if (gateId === "caption") draftCaptionPackage(campaign);
  if (gateId === "calendar") readyCalendarSlot(campaign);
  if (gateId === "approval") queueApprovalAgent(campaign);
  addAgentActivity("Launch Agent", `Handled launch gate: ${gateId}.`, campaign.id);
}

function refreshLaunchScore(campaign) {
  const readiness = getViralLaunchReadiness(campaign);
  campaign.viralLaunch = {
    ...createViralLaunchState(campaign.viralLaunch),
    selectedSceneId: readiness.scene?.id || campaign.viralLaunch?.selectedSceneId || "",
    score: readiness.score,
    status: readiness.status,
    lastScoredAt: new Date().toISOString()
  };
  return readiness;
}

async function runGateAgentWithProgress(gateId) {
  if (isGateAgentRunning(gateId)) return;
  const steps = gateAgentWorkflows[gateId] || ["Starting agent", "Handling gate", "Updating launch readiness"];
  const stepWeight = Math.max(1, steps.length);

  for (let index = 0; index < steps.length; index += 1) {
    updateAgentProgress(gateId, {
      status: "running",
      step: steps[index],
      percent: Math.max(8, Math.round(((index + 1) / (stepWeight + 1)) * 100))
    });
    await delay(420);
  }

  applyAgentGate(gateId);
  const campaign = getSelectedCampaign();
  if (campaign) refreshLaunchScore(campaign);
  completeAgentProgress(gateId, `${getGateLabel(gateId)} updated the launch workspace.`);
  saveState();
  renderViralLaunchControl();
}

async function runLaunchAgent() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const readiness = getViralLaunchReadiness(campaign);
  const openChecks = readiness.checks.filter((check) => !check.done);
  if (!openChecks.length) {
    showToast("All gates are clear");
    return;
  }

  try {
    elements.runLaunchAgent.disabled = true;
    for (const check of openChecks) {
      await runGateAgentWithProgress(check.id);
    }
  } finally {
    elements.runLaunchAgent.disabled = false;
  }

  addAgentActivity("Launch Agent", `Ran agentic fixes across ${openChecks.length} open launch gates for ${campaign.name}.`, campaign.id);
  saveState();
  renderViralLaunchControl();
  showToast("Launch Agent handled open gates");
}

function getSelectedLaunchScene(campaign) {
  const launch = campaign.viralLaunch || createViralLaunchState();
  const selected = campaign.scenes.find((scene) => scene.id === launch.selectedSceneId);
  return selected || campaign.scenes.find((scene) => scene.script) || campaign.scenes[0] || null;
}

function getLaunchHookText(scene) {
  const text = String(scene?.script || "").trim();
  if (!text) return "";
  return text.split(/[.!?]/)[0].trim() || text.slice(0, 140).trim();
}

function getViralLaunchReadiness(campaign) {
  const scene = getSelectedLaunchScene(campaign);
  const handledGates = campaign.viralLaunch?.agentHandledGates || {};
  const hook = getLaunchHookText(scene);
  const hasScript = Boolean(scene?.script?.trim());
  const hasPrompt = Boolean(scene?.prompt?.trim());
  const hasAudio = Boolean(campaign.elevenLabs?.voiceoverUrl || campaign.assets?.voiceover || campaign.remotion?.sourceAudioUrl);
  const hasMedia = Boolean(campaign.assets?.video || campaign.remotion?.outputUrl || campaign.assets?.remotionOutput);
  const hasCaption = Boolean(campaign.publishing?.caption?.trim());
  const hasHashtags = Boolean(campaign.publishing?.hashtags?.trim());
  const hasReadySlot = Boolean(campaign.publishing?.schedule?.some((slot) => ["ready", "scheduled", "published"].includes(slot.status)));
  const approvedScene = scene?.status === "approved";
  const allApprovals = campaign.approvals?.length ? campaign.approvals.every((check) => check.done) : false;
  const regulated = isRegulatedBrand(campaign.brand);
  const complianceReady = regulated ? allApprovals && Boolean(campaign.guardrails?.trim()) : true;
  const hookWords = hook.split(/\s+/).filter(Boolean).length;
  const hookHasTension = /\b(cost|risk|wait|stuck|hidden|why|stop|without|before|after|miss|clear|faster|today|now)\b/i.test(hook);
  const hookConcise = hookWords >= 6 && hookWords <= 18;

  const checks = [
    {
      id: "hook",
      label: "Hook opens with tension",
      detail: hookHasTension ? "Hook contains urgency, contrast, or a problem cue." : "Strengthen the opening tension or contrast.",
      done: hasScript && hookHasTension,
      agentHandled: Boolean(handledGates.hook)
    },
    {
      id: "script",
      label: "Script can travel to audio",
      detail: hasScript ? "Scene script is ready for voiceover context." : "Add script text to the selected scene.",
      done: hasScript,
      agentHandled: Boolean(handledGates.script)
    },
    {
      id: "prompt",
      label: "Visual prompt supports the story",
      detail: hasPrompt ? "Higgsfield prompt is available." : "Add a visual prompt tied to the script.",
      done: hasPrompt,
      agentHandled: Boolean(handledGates.prompt)
    },
    {
      id: "audio",
      label: "Audio or Remotion source exists",
      detail: hasAudio
        ? "Voiceover/source audio is linked."
        : handledGates.audio?.detail || "Add ElevenLabs audio or Remotion source audio.",
      done: hasAudio,
      agentHandled: Boolean(handledGates.audio)
    },
    {
      id: "media",
      label: "Publishable media exists",
      detail: hasMedia
        ? "Final or Remotion media is linked."
        : handledGates.media?.detail || "Add final video or Remotion output URL.",
      done: hasMedia,
      agentHandled: Boolean(handledGates.media)
    },
    {
      id: "caption",
      label: "Caption package is ready",
      detail: hasCaption && hasHashtags ? "Caption and hashtags are ready." : "Add caption and hashtags before posting.",
      done: hasCaption && hasHashtags,
      agentHandled: Boolean(handledGates.caption)
    },
    {
      id: "calendar",
      label: "Calendar slot is ready",
      detail: hasReadySlot ? "At least one slot is ready, scheduled, or published." : "Mark one Publishing Calendar slot as Ready.",
      done: hasReadySlot,
      agentHandled: Boolean(handledGates.calendar)
    },
    {
      id: "approval",
      label: regulated ? "Regulated approvals are complete" : "Human review path is visible",
      detail: complianceReady
        ? regulated
          ? "Regulated guardrails and approvals are complete."
          : "Standard brand can move through manual launch review."
        : handledGates.approval?.detail || "Hold launch until compliance guardrails and approval checks are complete.",
      done: complianceReady,
      agentHandled: Boolean(handledGates.approval)
    }
  ];

  let score = 0;
  if (hasScript) score += 16;
  if (hookHasTension) score += 14;
  if (hookConcise) score += 8;
  if (approvedScene) score += 8;
  if (hasPrompt) score += 10;
  if (hasAudio) score += 10;
  if (hasMedia) score += 12;
  if (hasCaption) score += 10;
  if (hasHashtags) score += 4;
  if (hasReadySlot) score += 4;
  if (complianceReady) score += 4;

  const doneCount = checks.filter((check) => check.done).length;
  const status = score >= 78 && complianceReady ? "launch-ready" : score >= 58 ? "needs-final-checks" : "draft";
  return { scene, hook, checks, score: Math.max(0, Math.min(100, score)), doneCount, totalCount: checks.length, status, regulated, complianceReady };
}

function getViralLaunchStatusClass(status) {
  if (status === "launch-ready") return "approved";
  if (status === "needs-final-checks") return "needs-review";
  return "not-started";
}

function getViralLaunchStatusLabel(status) {
  if (status === "launch-ready") return "Launch ready";
  if (status === "manual-ready") return "Manual launch ready";
  if (status === "needs-final-checks") return "Needs final checks";
  return "Draft launch";
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

function getViralLaunchPack(campaign) {
  const readiness = getViralLaunchReadiness(campaign);
  const scene = readiness.scene;
  return {
    campaign: campaign.name,
    brand: campaign.brand,
    platforms: getCampaignPlatforms(campaign),
    launchScore: readiness.score,
    launchStatus: getViralLaunchStatusLabel(campaign.viralLaunch?.status === "manual-ready" ? "manual-ready" : readiness.status),
    selectedScene: scene
      ? {
          title: scene.title,
          status: scene.status,
          hook: readiness.hook,
          script: scene.script,
          visualPrompt: scene.prompt,
          compliance: scene.compliance
        }
      : null,
    publishing: getPublishingPackage(campaign),
    checklist: readiness.checks,
    manualPostingSteps: [
      "Open the approved media URL or Remotion output.",
      "Use the caption, hashtags, and platform notes exactly as reviewed.",
      "Post or schedule only on the approved platform slot.",
      "Watch comments, retention, saves, shares, and clip-worthy moments immediately after publish.",
      "Feed public response signals into Agent Ops for repurpose and viral lift decisions."
    ],
    complianceWarning: readiness.complianceReady
      ? "Compliance posture is clear for the current brand state."
      : "Do not publish regulated content until guardrails and human approvals are complete."
  };
}

function renderCampaignSelect() {
  if (!state.campaigns.length) {
    elements.launchCampaignSelect.innerHTML = `<option>No campaigns yet</option>`;
    elements.launchCampaignSelect.disabled = true;
    return;
  }
  elements.launchCampaignSelect.disabled = false;
  elements.launchCampaignSelect.innerHTML = state.campaigns
    .map((campaign) => `<option value="${escapeHtml(campaign.id)}">${escapeHtml(campaign.brand)} - ${escapeHtml(campaign.name)}</option>`)
    .join("");
  elements.launchCampaignSelect.value = selectedCampaignId || state.campaigns[0].id;
}

function renderViralLaunchControl() {
  const campaign = getSelectedCampaign();
  renderCampaignSelect();
  if (!campaign) {
    elements.viralLaunchStatus.className = "status-pill not-started";
    elements.viralLaunchStatus.textContent = "No campaign";
    elements.viralLaunchScoreboard.innerHTML = "";
    elements.agenticLaunchSummary.innerHTML = "";
    elements.viralLaunchCandidate.innerHTML = `<option>No campaigns yet</option>`;
    elements.viralLaunchCandidate.disabled = true;
    elements.viralLaunchCandidatePreview.innerHTML = `<p class="meta-row">Open the Command Center and create a campaign before using Viral Launch Control.</p>`;
    elements.viralLaunchChecklist.innerHTML = "";
    return;
  }

  const launch = campaign.viralLaunch || createViralLaunchState();
  const readiness = getViralLaunchReadiness(campaign);
  const selectedScene = readiness.scene;
  if (!launch.selectedSceneId && selectedScene) launch.selectedSceneId = selectedScene.id;

  const status = launch.status === "manual-ready" ? "manual-ready" : readiness.status;
  elements.viralLaunchStatus.className = `status-pill ${status === "manual-ready" ? "approved" : getViralLaunchStatusClass(status)}`;
  elements.viralLaunchStatus.textContent = `${getViralLaunchStatusLabel(status)} - ${readiness.score}`;

  elements.viralLaunchScoreboard.innerHTML = [
    { label: "Launch score", value: readiness.score, detail: "hook and readiness" },
    { label: "Checklist", value: `${readiness.doneCount}/${readiness.totalCount}`, detail: "launch gates clear" },
    { label: "Candidate", value: selectedScene ? "1" : "0", detail: selectedScene?.title || "scene missing" },
    { label: "Compliance", value: readiness.complianceReady ? "Clear" : "Hold", detail: readiness.regulated ? "regulated brand" : "standard brand" }
  ]
    .map(
      (item) => `
        <article>
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
          <small>${escapeHtml(item.detail)}</small>
        </article>
      `
    )
    .join("");

  const handledCount = readiness.checks.filter((check) => check.agentHandled && !check.done).length;
  elements.agenticLaunchSummary.innerHTML = `
    <article>
      <strong>Launch Readiness Agent</strong>
      <p>${
        handledCount
          ? `${handledCount} open gates have already been handled agentically and are waiting on returned platform outputs or human approval.`
          : "Every open gate can be handled from this page. Use Run Launch Agent or run a single gate agent below."
      }</p>
      ${campaign.viralLaunch?.agentSummary ? `<small>${escapeHtml(campaign.viralLaunch.agentSummary)}</small>` : ""}
    </article>
  `;

  if (!campaign.scenes.length) {
    elements.viralLaunchCandidate.innerHTML = `<option>No scenes yet</option>`;
    elements.viralLaunchCandidate.disabled = true;
    elements.viralLaunchCandidatePreview.innerHTML = `<p class="meta-row">Add a scripted scene before selecting a launch candidate.</p>`;
  } else {
    elements.viralLaunchCandidate.disabled = false;
    elements.viralLaunchCandidate.innerHTML = campaign.scenes
      .map((scene, index) => `<option value="${escapeHtml(scene.id)}">${String(index + 1).padStart(2, "0")} ${escapeHtml(scene.title || "Untitled scene")}</option>`)
      .join("");
    elements.viralLaunchCandidate.value = selectedScene?.id || campaign.scenes[0].id;
    elements.viralLaunchCandidatePreview.innerHTML = `
      <div class="launch-hook">
        <span>Opening hook</span>
        <strong>${escapeHtml(readiness.hook || "Hook pending")}</strong>
      </div>
      <p>${escapeHtml(selectedScene?.script || "Add a script to create the audio-led posting packet.")}</p>
      <small>${escapeHtml(selectedScene?.prompt || "Visual prompt pending.")}</small>
    `;
  }

  elements.viralLaunchChecklist.innerHTML = readiness.checks
    .map(
      (check) => `
        <article class="viral-launch-check ${check.done ? "ready" : check.agentHandled ? "agent-queued" : ""}">
          <span>${check.done ? "Ready" : check.agentHandled ? "Agent queued" : "Open"}</span>
          <div>
            <strong>${escapeHtml(check.label)}</strong>
            <small>${escapeHtml(check.detail)}</small>
            ${
              check.done
                ? ""
                : `<button class="mini-button agent-gate-button" type="button" data-agent-gate="${escapeHtml(check.id)}" ${isGateAgentRunning(check.id) ? "disabled" : ""}>${isGateAgentRunning(check.id) ? "Agent Running" : check.agentHandled ? "Run Agent Again" : "Run Gate Agent"}</button>`
            }
          </div>
        </article>
      `
    )
    .join("");
  renderAgentProgress();
}

function scoreViralLaunch() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const readiness = getViralLaunchReadiness(campaign);
  campaign.viralLaunch = {
    ...createViralLaunchState(campaign.viralLaunch),
    selectedSceneId: readiness.scene?.id || "",
    score: readiness.score,
    status: readiness.status,
    lastScoredAt: new Date().toISOString()
  };
  addAgentActivity("Viral launch", `Scored ${campaign.name} at ${readiness.score}/100 for immediate posting readiness.`, campaign.id);
  saveState();
  renderViralLaunchControl();
  showToast("Viral launch scored");
}

function markManualLaunchReady() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const readiness = getViralLaunchReadiness(campaign);
  campaign.viralLaunch = {
    ...createViralLaunchState(campaign.viralLaunch),
    selectedSceneId: readiness.scene?.id || "",
    score: readiness.score,
    status: "manual-ready",
    lastScoredAt: new Date().toISOString(),
    launchNotes:
      readiness.status === "launch-ready"
        ? "Approved for immediate manual posting packet."
        : "Manual-ready mark applied with open checklist items visible for human judgment."
  };
  if (!campaign.publishing.schedule?.length) campaign.publishing.schedule = createSuggestedPublishingSchedule(campaign);
  const firstSlot = campaign.publishing.schedule[0];
  if (firstSlot && firstSlot.status === "draft") firstSlot.status = "ready";
  campaign.publishing.status = "manual-launch-ready";
  addAgentActivity("Viral launch", `Marked ${campaign.name} manual-launch ready with score ${readiness.score}/100.`, campaign.id);
  saveState();
  renderViralLaunchControl();
  showToast("Manual launch ready");
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied`);
  } catch (error) {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.left = "-9999px";
    document.body.appendChild(fallback);
    fallback.select();
    try {
      document.execCommand("copy");
      showToast(`${label} copied`);
    } catch (fallbackError) {
      showToast(`${label} ready in export`);
    } finally {
      fallback.remove();
    }
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

function showTutorialReturnLink() {
  const params = new URLSearchParams(window.location.search);
  const returnTarget = params.get("tutorialReturn");
  if (!returnTarget) return;
  const safeTarget = returnTarget.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeTarget) return;
  const link = document.createElement("a");
  link.id = "tutorialReturnLink";
  link.className = "tutorial-return-link";
  link.href = `./command-center-tutorial.html#${safeTarget}`;
  link.textContent = "Back to tutorial section";
  document.body.appendChild(link);
}

elements.launchCampaignSelect.addEventListener("change", (event) => {
  selectedCampaignId = event.target.value;
  saveState();
  renderViralLaunchControl();
});

elements.viralLaunchCandidate.addEventListener("change", (event) => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  campaign.viralLaunch = {
    ...createViralLaunchState(campaign.viralLaunch),
    selectedSceneId: event.target.value,
    status: campaign.viralLaunch?.status === "manual-ready" ? "draft" : campaign.viralLaunch?.status || "draft"
  };
  saveState();
  renderViralLaunchControl();
});

elements.viralLaunchChecklist.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-agent-gate]");
  if (!button) return;
  await runGateAgentWithProgress(button.dataset.agentGate);
  showToast("Gate Agent handled this item");
});

elements.scoreViralLaunch.addEventListener("click", scoreViralLaunch);
elements.runLaunchAgent.addEventListener("click", runLaunchAgent);
elements.markManualLaunchReady.addEventListener("click", markManualLaunchReady);
elements.copyViralLaunchPack.addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  copyText(JSON.stringify(getViralLaunchPack(campaign), null, 2), "Viral launch pack");
  addAgentActivity("Viral launch", `Copied manual posting packet for ${campaign.name}.`, campaign.id);
  saveState();
  renderViralLaunchControl();
});

showTutorialReturnLink();
renderViralLaunchControl();
