const storageKey = "ota-content-command-center-v1";
const githubRepoFullName = "ADMIOC/ota-content-command-center";

const stageTemplates = [
  {
    name: "Campaign setup and creative direction",
    shortName: "Setup",
    checklist: [
      "Brand and campaign name confirmed",
      "Creative direction written",
      "Platform target selected",
      "Output quantity and owner assigned",
      "Compliance guardrails added"
    ]
  },
  {
    name: "Scene planning and compliance guardrails",
    shortName: "Scenes",
    checklist: [
      "Scene list drafted",
      "Each scene has a Higgsfield prompt",
      "Claims, medical references, and brand language reviewed",
      "Thumbnail direction captured",
      "Revision path assigned"
    ]
  },
  {
    name: "Higgsfield video generation",
    shortName: "Higgsfield",
    checklist: [
      "Generation files created",
      "Raw outputs collected",
      "Failed generations marked",
      "Approved clips moved to assembly queue"
    ]
  },
  {
    name: "Human QA and approvals",
    shortName: "QA",
    checklist: [
      "Reviewer assigned",
      "Visual quality approved",
      "Compliance check completed",
      "Caption accuracy reviewed",
      "Final approval recorded"
    ]
  },
  {
    name: "Final video assembly",
    shortName: "Assembly",
    checklist: [
      "Final edit assembled",
      "Audio levels checked",
      "Thumbnail exported",
      "Final video rendered",
      "Export naming matches storage path"
    ]
  },
  {
    name: "Caption, hashtag, and platform package prep",
    shortName: "Package",
    checklist: [
      "Caption written",
      "Hashtags approved",
      "Platform notes added",
      "Publishing package reviewed"
    ]
  },
  {
    name: "Storage handoff",
    shortName: "Bunny",
    checklist: [
      "Bunny folder path confirmed",
      "Final video URL added",
      "Thumbnail URL added",
      "Scene files URL added",
      "Approval document URL added"
    ]
  },
  {
    name: "Publishing handoff through Blotato",
    shortName: "Blotato",
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
  "Thumbnail reads as a reduced full infographic cover",
  "Bunny storage links complete",
  "Publishing package ready for Blotato"
];

const reviewSections = [
  { id: "campaign-overview", name: "Campaign Overview" },
  { id: "workflow-stage", name: "Workflow Stage" },
  { id: "scene-queue", name: "Scene Queue" },
  { id: "approval-gate", name: "Approval Gate" },
  { id: "bunny-storage", name: "Bunny Storage" },
  { id: "publishing-package", name: "Publishing Package" }
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
        prompt:
          "Hospital eligibility team facing a visible backlog of unresolved Medicaid verification work, realistic operational tone, clean documentary lighting.",
        compliance:
          "Keep the scene anonymous and avoid showing patient names or records.",
        status: "approved"
      },
      {
        id: makeId(),
        title: "CRS Workflow Reveal",
        prompt:
          "A calm operations dashboard organizes eligibility work into clear next actions, with staff moving from confusion to confident triage.",
        compliance:
          "Represent workflow assistance without implying fully autonomous coverage decisions.",
        status: "in-progress"
      }
    ]
  }
];

let state = loadState();
let selectedCampaignId = state.selectedCampaignId || state.campaigns[0]?.id || "";
let selectedStageIndex = state.selectedStageIndex || 0;
let selectedReviewSectionId = state.selectedReviewSectionId || reviewSections[0].id;

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
  readinessScore: document.querySelector("#readinessScore"),
  stageTabs: Array.from(document.querySelectorAll(".stage-tab")),
  stageKicker: document.querySelector("#stageKicker"),
  stageTitle: document.querySelector("#stageTitle"),
  stageStatus: document.querySelector("#stageStatus"),
  stageChecklist: document.querySelector("#stageChecklist"),
  stageOwner: document.querySelector("#stageOwner"),
  stageDue: document.querySelector("#stageDue"),
  stageNotes: document.querySelector("#stageNotes"),
  sceneList: document.querySelector("#sceneList"),
  approvalStatus: document.querySelector("#approvalStatus"),
  approvalChecks: document.querySelector("#approvalChecks"),
  bunnyFolder: document.querySelector("#bunnyFolder"),
  assetVideo: document.querySelector("#assetVideo"),
  assetThumbnail: document.querySelector("#assetThumbnail"),
  assetCaptionDoc: document.querySelector("#assetCaptionDoc"),
  assetScenes: document.querySelector("#assetScenes"),
  assetApprovalDoc: document.querySelector("#assetApprovalDoc"),
  captionText: document.querySelector("#captionText"),
  hashtags: document.querySelector("#hashtags"),
  platformNotes: document.querySelector("#platformNotes"),
  campaignDialog: document.querySelector("#campaignDialog"),
  campaignForm: document.querySelector("#campaignForm"),
  sceneDialog: document.querySelector("#sceneDialog"),
  sceneForm: document.querySelector("#sceneForm"),
  reviewPanel: document.querySelector("#reviewPanel"),
  reviewCount: document.querySelector("#reviewCount"),
  reviewSectionButtons: document.querySelector("#reviewSectionButtons"),
  reviewerName: document.querySelector("#reviewerName"),
  reviewPriority: document.querySelector("#reviewPriority"),
  reviewComment: document.querySelector("#reviewComment"),
  reviewRequestList: document.querySelector("#reviewRequestList"),
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

function createCampaign(input) {
  const safeBrand = input.brand.trim() || "Brand";
  const safeName = input.name.trim() || "Untitled Campaign";
  return {
    id: makeId(),
    brand: safeBrand,
    name: safeName,
    platform: input.platform,
    quantity: Number(input.quantity) || 1,
    dueDate: input.dueDate,
    owner: input.owner.trim(),
    creativeDirection: input.creativeDirection.trim(),
    guardrails: input.guardrails.trim(),
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
      captionDoc: "",
      scenes: "",
      approvalDoc: ""
    },
    publishing: {
      caption: "",
      hashtags: "",
      platformNotes: "",
      status: "not-ready"
    },
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
    "Use CRS-approved thumbnail. Confirm no patient-identifying information appears in the final render.";
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
    campaigns: defaultCampaigns.map(normalizeCampaign),
    selectedCampaignId: "",
    selectedStageIndex: 0,
    selectedReviewSectionId: reviewSections[0].id,
    reviewRequests: []
  });
}

function normalizeState(workspace) {
  workspace.reviewRequests = workspace.reviewRequests || [];
  workspace.selectedReviewSectionId = workspace.selectedReviewSectionId || reviewSections[0].id;
  workspace.campaigns.forEach((campaign) => {
    campaign.reviewRequests = campaign.reviewRequests || [];
  });
  return workspace;
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
  renderMetrics();
  renderCampaignList();
  renderCampaign();
  renderReviewPanel();
  saveState();
}

function renderFilters() {
  if (elements.stageFilter.options.length) return;
  const options = [{ label: "All Stages", value: "all" }].concat(
    stageTemplates.map((stage, index) => ({ label: stage.shortName, value: String(index) }))
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

  elements.stageTabs.forEach((tab, index) => {
    tab.classList.toggle("active", index === selectedStageIndex);
    tab.classList.toggle("approved", campaign.stages[index].status === "approved");
    tab.classList.toggle("blocked", campaign.stages[index].status === "blocked");
  });

  elements.stageKicker.textContent = `Stage ${String(selectedStageIndex + 1).padStart(2, "0")}`;
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

function renderReviewPanel() {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  const allRequests = getCampaignReviewRequests(campaign);
  const activeSection = getActiveReviewSection();
  const activeRequests = allRequests.filter((request) => request.sectionId === activeSection.id);

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
  elements.assetCaptionDoc.value = campaign.assets.captionDoc || "";
  elements.assetScenes.value = campaign.assets.scenes || "";
  elements.assetApprovalDoc.value = campaign.assets.approvalDoc || "";
  elements.captionText.value = campaign.publishing.caption || "";
  elements.hashtags.value = campaign.publishing.hashtags || "";
  elements.platformNotes.value = campaign.publishing.platformNotes || "";
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

function getManifest(campaign) {
  return {
    brand: campaign.brand,
    campaign: campaign.name,
    platform: campaign.platform,
    quantity: campaign.quantity,
    dueDate: campaign.dueDate,
    owner: campaign.owner,
    readiness: getReadiness(campaign),
    bunny: campaign.assets,
    publishing: campaign.publishing,
    scenes: campaign.scenes,
    approvals: campaign.approvals,
    reviewRequests: getCampaignReviewRequests(campaign),
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
    caption: campaign.publishing.caption,
    hashtags: campaign.publishing.hashtags,
    platformNotes: campaign.publishing.platformNotes,
    bunnyFolder: campaign.assets.bunnyFolder
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

document.querySelector("#openCampaignForm").addEventListener("click", () => {
  elements.campaignDialog.showModal();
});

document.querySelector("[data-action='new-campaign']").addEventListener("click", () => {
  elements.campaignDialog.showModal();
});

document.querySelector("#seedWorkspace").addEventListener("click", () => {
  state = {
    campaigns: defaultCampaigns.map(normalizeCampaign),
    selectedCampaignId: "",
    selectedStageIndex: 0
  };
  selectedCampaignId = state.campaigns[0]?.id || "";
  selectedStageIndex = 0;
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

elements.reviewSectionButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-section]");
  if (!button) return;
  selectedReviewSectionId = button.dataset.reviewSection;
  render();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".review-jump");
  if (!button) return;
  selectedReviewSectionId = button.dataset.reviewSection || reviewSections[0].id;
  render();
  elements.reviewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.reviewComment.focus();
});

document.querySelector("#copyReviewRequest").addEventListener("click", () => {
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

document.querySelector("#openGithubIssue").addEventListener("click", () => {
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
  const campaign = createCampaign(data);
  state.campaigns.unshift(campaign);
  selectedCampaignId = campaign.id;
  selectedStageIndex = 0;
  elements.campaignForm.reset();
  elements.campaignDialog.close();
  render();
  showToast("Campaign launched");
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
    prompt: data.prompt.trim(),
    compliance: data.compliance.trim(),
    status: "not-started"
  });
  campaign.stages[1].checks[0].done = true;
  campaign.stages[1].checks[1].done = true;
  elements.sceneForm.reset();
  elements.sceneDialog.close();
  render();
  showToast("Scene added");
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

document.querySelector("#addScene").addEventListener("click", () => {
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
  ["assetCaptionDoc", "captionDoc"],
  ["assetScenes", "scenes"],
  ["assetApprovalDoc", "approvalDoc"]
].forEach(([elementKey, assetKey]) => {
  elements[elementKey].addEventListener("input", (event) => {
    const campaign = getSelectedCampaign();
    if (!campaign) return;
    campaign.assets[assetKey] = event.target.value;
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

document.querySelector("#copyBunnyManifest").addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  copyText(JSON.stringify(getManifest(campaign), null, 2), "Bunny manifest");
});

document.querySelector("#copyPublishingPackage").addEventListener("click", () => {
  const campaign = getSelectedCampaign();
  if (!campaign) return;
  copyText(JSON.stringify(getPublishingPackage(campaign), null, 2), "Publishing package");
});

if (!selectedCampaignId && state.campaigns[0]) {
  selectedCampaignId = state.campaigns[0].id;
}

render();
