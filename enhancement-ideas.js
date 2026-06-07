const storageKey = "ota-content-command-center-v1";
const githubRepoFullName = "ADMIOC/ota-content-command-center";

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

const fallbackCampaign = {
  id: "command-center",
  brand: "OTA Social Engine",
  name: "Content Command Center",
  owner: "Team",
  platform: "Multi-platform",
  assets: {},
  reviewRequests: []
};

const params = new URLSearchParams(window.location.search);
let workspace = loadWorkspace();
let selectedCampaignId = params.get("campaign") || workspace.selectedCampaignId || getCampaigns()[0]?.id || fallbackCampaign.id;
let selectedSectionId = params.get("section") || workspace.selectedReviewSectionId || reviewSections[0].id;

const elements = {
  campaign: document.querySelector("#enhancementCampaign"),
  section: document.querySelector("#enhancementSection"),
  reviewer: document.querySelector("#enhancementReviewer"),
  priority: document.querySelector("#enhancementPriority"),
  comment: document.querySelector("#enhancementComment"),
  ideaCount: document.querySelector("#enhancementIdeaCount"),
  summary: document.querySelector("#enhancementSummary"),
  requestList: document.querySelector("#enhancementRequestList"),
  saveIdea: document.querySelector("#saveEnhancementIdea"),
  copyRequest: document.querySelector("#copyEnhancementRequest"),
  openGithubIssue: document.querySelector("#openEnhancementGithubIssue"),
  backToCommandCenter: document.querySelector("#backToCommandCenter"),
  toast: document.querySelector("#toast")
};

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadWorkspace() {
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      parsed.campaigns = Array.isArray(parsed.campaigns) ? parsed.campaigns : [];
      parsed.reviewRequests = Array.isArray(parsed.reviewRequests) ? parsed.reviewRequests : [];
      parsed.campaigns.forEach((campaign) => {
        campaign.reviewRequests = Array.isArray(campaign.reviewRequests) ? campaign.reviewRequests : [];
        campaign.assets = campaign.assets || {};
      });
      return parsed;
    } catch (error) {
      console.warn("Could not read stored workspace", error);
    }
  }
  return {
    campaigns: [fallbackCampaign],
    selectedCampaignId: fallbackCampaign.id,
    selectedReviewSectionId: reviewSections[0].id,
    reviewRequests: [],
    agentActivity: []
  };
}

function saveWorkspace() {
  workspace.selectedCampaignId = selectedCampaignId;
  workspace.selectedReviewSectionId = selectedSectionId;
  localStorage.setItem(storageKey, JSON.stringify(workspace));
}

function getCampaigns() {
  return workspace.campaigns?.length ? workspace.campaigns : [fallbackCampaign];
}

function getSelectedCampaign() {
  return getCampaigns().find((campaign) => campaign.id === selectedCampaignId) || getCampaigns()[0];
}

function getSelectedSection() {
  return reviewSections.find((section) => section.id === selectedSectionId) || reviewSections[0];
}

function getCampaignRequests(campaign = getSelectedCampaign()) {
  const topLevelRequests = (workspace.reviewRequests || []).filter((request) => request.campaignId === campaign.id);
  const campaignRequests = Array.isArray(campaign.reviewRequests) ? campaign.reviewRequests : [];
  return [...campaignRequests, ...topLevelRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getEnhancementIssueUrl(campaign, request) {
  const title = `[Enhancement Idea] ${request.sectionName}: ${campaign.name}`;
  const body = [
    `Campaign: ${campaign.name}`,
    `Brand: ${campaign.brand || "Unspecified"}`,
    `Section: ${request.sectionName}`,
    `Priority: ${request.priority}`,
    `Reviewer: ${request.reviewer || "Unspecified"}`,
    "",
    "Enhancement idea:",
    request.comment,
    "",
    "Desired outcome:",
    "Make this part of the Content Command Center easier, clearer, faster, or more agentically guided for OTA creators.",
    "",
    "Context:",
    `Platform: ${campaign.platform || "Not set"}`,
    `Owner: ${campaign.owner || "Unassigned"}`,
    `Bunny folder: ${campaign.assets?.bunnyFolder || "Not set"}`
  ].join("\n");
  const url = new URL(`https://github.com/${githubRepoFullName}/issues/new`);
  url.searchParams.set("title", title);
  url.searchParams.set("body", body);
  return url.toString();
}

function buildRequest() {
  const campaign = getSelectedCampaign();
  const section = getSelectedSection();
  const comment = elements.comment.value.trim();
  if (!comment) return null;
  const request = {
    id: makeId(),
    campaignId: campaign.id,
    campaignName: campaign.name,
    sectionId: section.id,
    sectionName: section.name,
    reviewer: elements.reviewer.value.trim(),
    priority: elements.priority.value,
    comment,
    createdAt: new Date().toISOString()
  };
  request.issueUrl = getEnhancementIssueUrl(campaign, request);
  return request;
}

function saveRequest(request) {
  workspace.reviewRequests = Array.isArray(workspace.reviewRequests) ? workspace.reviewRequests : [];
  workspace.reviewRequests.unshift(request);
  workspace.agentActivity = Array.isArray(workspace.agentActivity) ? workspace.agentActivity : [];
  workspace.agentActivity.push({
    id: makeId(),
    type: "Enhancement intake",
    message: `Captured enhancement idea for ${request.sectionName}.`,
    campaignId: request.campaignId,
    createdAt: new Date().toISOString()
  });
  elements.comment.value = "";
  saveWorkspace();
  render();
}

function render() {
  const campaigns = getCampaigns();
  const campaign = getSelectedCampaign();
  selectedCampaignId = campaign.id;
  selectedSectionId = reviewSections.some((section) => section.id === selectedSectionId)
    ? selectedSectionId
    : reviewSections[0].id;

  elements.campaign.innerHTML = campaigns
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.brand || "Brand")} - ${escapeHtml(item.name)}</option>`)
    .join("");
  elements.campaign.value = selectedCampaignId;

  elements.section.innerHTML = reviewSections
    .map((section) => `<option value="${escapeHtml(section.id)}">${escapeHtml(section.name)}</option>`)
    .join("");
  elements.section.value = selectedSectionId;

  elements.reviewer.value = elements.reviewer.value || campaign.owner || "";

  const requests = getCampaignRequests(campaign);
  const selectedSectionRequests = requests.filter((request) => request.sectionId === selectedSectionId);
  const openLike = requests.filter((request) => request.priority === "Blocking" || request.priority === "Important").length;
  elements.ideaCount.className = `status-pill ${requests.length ? "needs-review" : "not-started"}`;
  elements.ideaCount.textContent = `${requests.length} ${requests.length === 1 ? "idea" : "ideas"}`;
  elements.summary.innerHTML = [
    { label: "Campaign ideas", value: requests.length },
    { label: "Selected section", value: selectedSectionRequests.length },
    { label: "Important or blocking", value: openLike }
  ]
    .map((item) => `<article><strong>${item.value}</strong><span>${escapeHtml(item.label)}</span></article>`)
    .join("");

  const targetHash = reviewSectionTargets[selectedSectionId] || "#campaign-overview";
  elements.backToCommandCenter.href = `./index.html${targetHash}`;

  if (!requests.length) {
    elements.requestList.innerHTML = `<p class="meta-row">No enhancement ideas saved for this campaign yet.</p>`;
    return;
  }

  elements.requestList.innerHTML = requests
    .map(
      (request) => `
        <article class="review-request-card">
          <header>
            <div>
              <strong>${escapeHtml(request.sectionName)}</strong>
              <small>${escapeHtml(request.reviewer || "Reviewer")} - ${new Date(request.createdAt).toLocaleString()}</small>
            </div>
            <span class="status-pill ${request.priority === "Blocking" ? "blocked" : request.priority === "Important" ? "needs-review" : "not-started"}">${escapeHtml(request.priority)}</span>
          </header>
          <p>${escapeHtml(request.comment)}</p>
          <a href="${escapeHtml(request.issueUrl)}" target="_blank" rel="noreferrer">Open GitHub issue draft</a>
        </article>
      `
    )
    .join("");
}

function showTutorialReturnLink() {
  const returnTarget = params.get("tutorialReturn");
  if (!returnTarget) return;
  const safeTarget = returnTarget.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeTarget) return;
  const returnHref = `./command-center-tutorial.html#${safeTarget}`;
  const tutorialLink = document.querySelector('a[href="./command-center-tutorial.html"]');
  if (tutorialLink) tutorialLink.href = returnHref;
  const link = document.createElement("a");
  link.id = "tutorialReturnLink";
  link.className = "tutorial-return-link";
  link.href = returnHref;
  link.textContent = "Back to tutorial section";
  document.body.appendChild(link);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied`);
  } catch (error) {
    showToast(`${label} ready`);
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
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

elements.campaign.addEventListener("change", (event) => {
  selectedCampaignId = event.target.value;
  saveWorkspace();
  render();
});

elements.section.addEventListener("change", (event) => {
  selectedSectionId = event.target.value;
  saveWorkspace();
  render();
});

elements.saveIdea.addEventListener("click", () => {
  const request = buildRequest();
  if (!request) {
    showToast("Add an enhancement idea first");
    elements.comment.focus();
    return;
  }
  saveRequest(request);
  showToast("Enhancement idea saved");
});

elements.copyRequest.addEventListener("click", () => {
  const request = buildRequest();
  if (!request) {
    showToast("Add an enhancement idea first");
    elements.comment.focus();
    return;
  }
  copyText(
    JSON.stringify(
      {
        campaign: request.campaignName,
        section: request.sectionName,
        priority: request.priority,
        reviewer: request.reviewer,
        enhancementIdea: request.comment,
        githubIssueDraft: request.issueUrl
      },
      null,
      2
    ),
    "Enhancement request"
  );
});

elements.openGithubIssue.addEventListener("click", () => {
  const request = buildRequest();
  if (!request) {
    showToast("Add an enhancement idea first");
    elements.comment.focus();
    return;
  }
  saveRequest(request);
  window.open(request.issueUrl, "_blank", "noopener");
  showToast("GitHub issue draft opened");
});

showTutorialReturnLink();
render();
