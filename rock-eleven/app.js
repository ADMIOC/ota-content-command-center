const STORAGE_KEY = "rockElevenDealflowWorkspaceV4";

const reportState = {
  dealName: "",
  principal: "",
  assetClass: "",
  raiseSize: "",
  mode: "Expert Review",
  reportGenerated: false,
  sourceFiles: [],
};

const ddItems = [
  "Executed site-control documents, purchase agreements, ROFR instruments, and pricing.",
  "Complete financial model with cost, rate, absorption, NOI, cap-rate, and downside sensitivities.",
  "Sponsor track record schedule with addresses, dates, lenders, partners, exits, and references.",
  "Fund vehicle, jurisdiction, fee/promote waterfall, GP commitment, governance, and reporting terms.",
  "Corporate registry, beneficial ownership, KYC/AML package, and related-party disclosure.",
  "Third-party market and absorption study supporting the capital deployment schedule.",
  "Exit buyer universe, portfolio roll-up logic, and refinancing/sale comparables.",
];

const questions = [
  "What binding rights does the sponsor have over each asset being financed?",
  "What exact assumptions bridge the raise amount to the target portfolio value?",
  "Which lender, partner, or institutional reference can verify the sponsor's stated track record?",
  "Where does investor capital sit in the waterfall, and what downside controls exist?",
  "Who is the natural buyer or refinancing source at stabilization?",
];

const modeNotes = {
  "Expert Review": "Analyst oversight keeps source-package review, risk gates, and investment-committee readability defensible.",
  "Platform-Assisted": "Clients upload source materials and receive a structured draft only after analyst review.",
  "Institutional Workspace": "Repeat users manage source packages, report history, team review, and exports from a secure workspace.",
};

const sliders = [
  document.getElementById("evidenceSlider"),
  document.getElementById("controlSlider"),
  document.getElementById("cashSlider"),
  document.getElementById("exitSlider"),
  document.getElementById("reputationSlider"),
];

function hasSourcePackage() {
  return reportState.sourceFiles.length > 0;
}

function setText(id, value = "") {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateHeader() {
  setText("reportTitle", reportState.dealName);
  const meta = [reportState.principal, reportState.assetClass, reportState.raiseSize].filter(Boolean).join(" - ");
  setText("reportMeta", meta);
  setText("fundabilityScore");
  setText("verdictLabel");
  const verdictCard = document.getElementById("verdictCard");
  verdictCard.classList.remove("is-green", "is-gold", "is-cabernet", "is-red");
}

function renderEvidence() {
  document.getElementById("evidenceMap").innerHTML = "";
}

function renderScores() {
  document.getElementById("scoreGrid").innerHTML = "";
}

function renderFinalReport() {
  const title = document.getElementById("finalReportTitle");
  const badge = document.getElementById("finalReportBadge");
  const body = document.getElementById("finalReportBody");
  if (!title || !badge || !body) return;

  title.textContent = "";
  badge.textContent = "";
  body.innerHTML = "";

  if (!reportState.reportGenerated || !hasSourcePackage()) return;

  const generatedAt = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  title.textContent = reportState.dealName || "Source Package Review";
  badge.textContent = "Source package received";
  body.innerHTML = `
    <div class="report-summary-grid">
      <div>
        <strong>Source package</strong>
        <span>${reportState.sourceFiles.join(", ")}</span>
      </div>
      <div>
        <strong>Generated</strong>
        <span>${generatedAt}</span>
      </div>
    </div>
    <section>
      <h5>Review status</h5>
      <p>Source package received. Institutional scoring, evidence ratings, risk gates, and fundability conclusions require source-package review before publication.</p>
    </section>
  `;
}

function renderDiligence() {
  document.getElementById("ddList").innerHTML = "";
  document.getElementById("questionList").innerHTML = "";
}

function resetScenarioLab() {
  setText("evidenceValue");
  setText("controlValue");
  setText("cashValue");
  setText("exitValue");
  setText("reputationValue");
  setText("scenarioVerdict");
  setText("scenarioNarrative");
  document.getElementById("scoreNeedle").style.left = "0%";
  document.getElementById("openGates").innerHTML = "";
  setText("exitReadiness");
  sliders.forEach((slider) => {
    slider.disabled = true;
    slider.value = 0;
  });
}

function renderWorkspace() {
  updateHeader();
  renderEvidence();
  renderScores();
  resetScenarioLab();
  renderFinalReport();
  persistState();
}

function persistState() {
  const stateToPersist = { ...reportState, sourceFiles: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
}

function restoreState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    reportState.dealName = parsed.dealName || "";
    reportState.principal = parsed.principal || "";
    reportState.assetClass = parsed.assetClass || "";
    reportState.raiseSize = parsed.raiseSize || "";
    reportState.mode = parsed.mode || "Expert Review";
    reportState.reportGenerated = false;
    reportState.sourceFiles = [];
    document.getElementById("dealName").value = reportState.dealName;
    document.getElementById("principal").value = reportState.principal;
    document.getElementById("assetClass").value = reportState.assetClass;
    document.getElementById("raiseSize").value = reportState.raiseSize;
    document.querySelectorAll(".mode-button").forEach((button) => {
      const isActive = button.dataset.mode === reportState.mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", isActive ? "true" : "false");
    });
    document.getElementById("modeNote").textContent = modeNotes[reportState.mode];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function activateTab(button, focusTab = false) {
  document.querySelectorAll(".tab-button").forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", isActive ? "true" : "false");
    item.tabIndex = isActive ? 0 : -1;
  });
  document.querySelectorAll(".tab-panel").forEach((item) => {
    const isActive = item.id === `tab-${button.dataset.tab}`;
    item.classList.toggle("is-active", isActive);
    item.hidden = !isActive;
  });
  if (focusTab) button.focus();
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => activateTab(button));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = Array.from(document.querySelectorAll(".tab-button"));
    const currentIndex = tabs.indexOf(button);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length;
    event.preventDefault();
    activateTab(tabs[nextIndex], true);
  });
});

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mode-button").forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-checked", "false");
    });
    button.classList.add("is-active");
    button.setAttribute("aria-checked", "true");
    reportState.mode = button.dataset.mode;
    document.getElementById("modeNote").textContent = modeNotes[reportState.mode];
    persistState();
  });
});

["dealName", "principal", "assetClass", "raiseSize"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    reportState.dealName = document.getElementById("dealName").value.trim();
    reportState.principal = document.getElementById("principal").value.trim();
    reportState.assetClass = document.getElementById("assetClass").value;
    reportState.raiseSize = document.getElementById("raiseSize").value.trim();
    reportState.reportGenerated = false;
    renderWorkspace();
  });
});

document.getElementById("runReport").addEventListener("click", () => {
  const button = document.getElementById("runReport");
  const status = document.getElementById("reportStatus");
  reportState.dealName = document.getElementById("dealName").value.trim();
  reportState.principal = document.getElementById("principal").value.trim();
  reportState.assetClass = document.getElementById("assetClass").value;
  reportState.raiseSize = document.getElementById("raiseSize").value.trim();

  if (!hasSourcePackage()) {
    reportState.reportGenerated = false;
    status.textContent = "Attach a Source Package before generating a report.";
    renderWorkspace();
    return;
  }

  reportState.reportGenerated = true;
  button.disabled = true;
  button.textContent = "Registering source package...";
  status.textContent = "Source package received for review. No fundability score is generated from blank or manual assumptions.";
  document.querySelector(".report-stage").classList.add("is-refreshing");
  window.setTimeout(() => {
    renderWorkspace();
    document.querySelector(".report-stage").classList.remove("is-refreshing");
    button.disabled = false;
    button.textContent = "Generate Fundability Report";
    status.textContent = "Source package registered. Institutional scoring is withheld until review is complete.";
    document.querySelector(".report-stage").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 300);
});

document.getElementById("sourcePackage").addEventListener("change", (event) => {
  reportState.sourceFiles = Array.from(event.target.files || []).map((file) => file.name);
  reportState.reportGenerated = false;
  document.getElementById("sourceFeedback").textContent = hasSourcePackage()
    ? `${reportState.sourceFiles.length} source file${reportState.sourceFiles.length === 1 ? "" : "s"} selected: ${reportState.sourceFiles.slice(0, 3).join(", ")}${reportState.sourceFiles.length > 3 ? ", ..." : ""}.`
    : "Attach the Source Package before generating a report.";
  renderWorkspace();
});

document.getElementById("copySummary").addEventListener("click", async () => {
  const status = document.getElementById("copyStatus");
  const summary = hasSourcePackage()
    ? `Source package:\n- ${reportState.sourceFiles.join("\n- ")}\nStatus: Received for institutional review. Fundability scoring withheld until source-package review is complete.`
    : "No Source Package attached. No report generated.";
  await navigator.clipboard.writeText(summary);
  status.textContent = "Source package status copied to clipboard.";
  window.setTimeout(() => {
    status.textContent = "Exports are packaged only after source-package review.";
  }, 3500);
});

document.getElementById("resetApp").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
});

restoreState();
renderDiligence();
activateTab(document.querySelector(".tab-button.is-active"));
renderWorkspace();
