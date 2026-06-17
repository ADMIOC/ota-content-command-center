const STORAGE_KEY = "rockElevenDealflowWorkspaceV2";

const reportState = {
  dealName: "Rock Eleven Institutional Fundability Review",
  principal: "Rock Eleven Capital Committee",
  assetClass: "Residential Infrastructure",
  raiseSize: "CAD 120M",
  mode: "Expert Review",
  reportGenerated: false,
  scores: {
    "Capital absorption": 75,
    "Downside protection": 70,
    "Asset control": 70,
    "Cash-flow visibility": 70,
    "Sponsor bankability": 70,
    "Governance readiness": 70,
    "Policy alignment": 85,
    "Exit liquidity": 70,
    "Reputation safety": 70,
    "Evidence completeness": 75,
  },
};

const evidenceRows = [
  ["Market thesis", 85, "Strong"],
  ["Asset control", 70, "Moderate"],
  ["Financial model", 68, "Moderate"],
  ["Sponsor verification", 70, "Moderate"],
  ["Exit path", 70, "Moderate"],
];

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
  "Expert Review": "Analyst oversight keeps evidence ratings, risk gates, and investment posture defensible.",
  "Platform-Assisted": "Clients upload materials and receive a structured draft with analyst approval before delivery.",
  "Institutional Workspace": "Repeat users manage report history, scenario labs, team review, and exports from a secure workspace.",
};

const sliders = {
  "Evidence completeness": document.getElementById("evidenceSlider"),
  "Asset control": document.getElementById("controlSlider"),
  "Cash-flow visibility": document.getElementById("cashSlider"),
  "Exit liquidity": document.getElementById("exitSlider"),
  "Reputation safety": document.getElementById("reputationSlider"),
};

function weightedScore() {
  const scores = reportState.scores;
  return Math.round(
    scores["Capital absorption"] * 0.1 +
      scores["Downside protection"] * 0.13 +
      scores["Asset control"] * 0.14 +
      scores["Cash-flow visibility"] * 0.12 +
      scores["Sponsor bankability"] * 0.12 +
      scores["Governance readiness"] * 0.1 +
      scores["Policy alignment"] * 0.08 +
      scores["Exit liquidity"] * 0.08 +
      scores["Reputation safety"] * 0.07 +
      scores["Evidence completeness"] * 0.06,
  );
}

function verdictFor(score) {
  if (score >= 78) return "Green Light Fundable";
  if (score >= 64) return "Advance Diligence";
  if (score >= 45) return "Engage - Do Not Commit";
  return "Do Not Advance";
}

function gateList() {
  const scores = reportState.scores;
  const gates = [];
  if (scores["Asset control"] < 65) gates.push("Asset control is below institutional funding threshold.");
  if (scores["Evidence completeness"] < 70) gates.push("Evidence package is not complete enough for IC reliance.");
  if (scores["Cash-flow visibility"] < 60) gates.push("Cash-flow bridge needs model support and third-party validation.");
  if (scores["Reputation safety"] < 60) gates.push("KYC, document integrity, or governance risk remains unresolved.");
  if (scores["Downside protection"] < 55) gates.push("Capital stack lacks sufficient downside controls.");
  return gates;
}

function reportPosture(score) {
  if (score >= 78) {
    return "Green light fundable profile. The package is suitable for institutional capital review subject to final legal, KYC, and committee documentation.";
  }
  if (score >= 64) {
    return "Advance diligence. The opportunity is credible enough for institutional review, but funding should remain conditional on closing the identified evidence and risk gaps.";
  }
  if (score >= 45) {
    return "Engage, do not commit. The opportunity can stay in conversation, but the package is not yet bankable enough for a capital decision.";
  }
  return "Do not advance. The package requires material remediation before it should consume institutional committee time.";
}

function evidenceSummary() {
  return evidenceRows.map(([label, score, rating]) => `${label}: ${rating} (${score}/100)`);
}

function verdictTone(score) {
  if (score >= 78) return "is-green";
  if (score >= 64) return "is-gold";
  if (score >= 45) return "is-cabernet";
  return "is-red";
}

function updateHeader() {
  document.getElementById("reportTitle").textContent = reportState.dealName;
  document.getElementById("reportMeta").textContent = `Prepared for ${reportState.principal} - ${reportState.assetClass} - ${reportState.raiseSize}`;
  const score = weightedScore();
  const verdictCard = document.getElementById("verdictCard");
  document.getElementById("fundabilityScore").textContent = score;
  document.getElementById("verdictLabel").textContent = verdictFor(score);
  verdictCard.classList.remove("is-green", "is-gold", "is-cabernet", "is-red");
  verdictCard.classList.add(verdictTone(score));
}

function renderEvidence() {
  const map = document.getElementById("evidenceMap");
  map.innerHTML = evidenceRows
    .map(
      ([label, score, rating]) => `
        <div class="evidence-row">
          <span>${label}</span>
          <b><i style="width: ${score}%"></i></b>
          <small>${rating}</small>
        </div>
      `,
    )
    .join("");
}

function renderScores() {
  const grid = document.getElementById("scoreGrid");
  grid.innerHTML = Object.entries(reportState.scores)
    .map(
      ([label, score]) => `
        <article class="score-card">
          <strong>${score}</strong>
          <span>${label}</span>
          <p>${score >= 70 ? "Institutional-grade signal." : score >= 45 ? "Diligence required." : "Open funding gate."}</p>
        </article>
      `,
    )
    .join("");
}

function renderFinalReport(generated = reportState.reportGenerated) {
  const title = document.getElementById("finalReportTitle");
  const badge = document.getElementById("finalReportBadge");
  const body = document.getElementById("finalReportBody");
  if (!title || !badge || !body) return;

  if (!generated) {
    title.textContent = "Ready to generate";
    badge.textContent = "Awaiting intake";
    body.innerHTML = "<p>Complete the intake or use the current demo assumptions, then select Generate Fundability Report.</p>";
    return;
  }

  const score = weightedScore();
  const verdict = verdictFor(score);
  const gates = gateList();
  const generatedAt = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  title.textContent = reportState.dealName;
  badge.textContent = `${score} / ${verdict}`;
  body.innerHTML = `
    <div class="report-summary-grid">
      <div>
        <strong>Prepared for</strong>
        <span>${reportState.principal}</span>
      </div>
      <div>
        <strong>Asset class</strong>
        <span>${reportState.assetClass}</span>
      </div>
      <div>
        <strong>Raise size</strong>
        <span>${reportState.raiseSize}</span>
      </div>
      <div>
        <strong>Generated</strong>
        <span>${generatedAt}</span>
      </div>
    </div>
    <section>
      <h5>Executive verdict</h5>
      <p>${reportPosture(score)}</p>
    </section>
    <section>
      <h5>Evidence map</h5>
      <ul>${evidenceSummary().map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section>
      <h5>Open risk gates</h5>
      ${
        gates.length
          ? `<ul>${gates.map((gate) => `<li>${gate}</li>`).join("")}</ul>`
          : "<p>No critical open gates under the current scenario. Continue validating committee documentation and third-party support.</p>"
      }
    </section>
    <section>
      <h5>Diligence priorities</h5>
      <ol>${ddItems.slice(0, 4).map((item) => `<li>${item}</li>`).join("")}</ol>
    </section>
  `;
}

function renderDiligence() {
  document.getElementById("ddList").innerHTML = ddItems.map((item) => `<li>${item}</li>`).join("");
  document.getElementById("questionList").innerHTML = questions
    .map((question, index) => `<button type="button" aria-pressed="false">${question}</button>`)
    .join("");
  document.querySelectorAll(".question-list button").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.classList.toggle("is-selected");
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  });
}

function updateScenario() {
  Object.entries(sliders).forEach(([label, slider]) => {
    reportState.scores[label] = Number(slider.value);
  });

  const score = weightedScore();
  const verdict = verdictFor(score);
  document.getElementById("evidenceValue").textContent = `${reportState.scores["Evidence completeness"]}%`;
  document.getElementById("controlValue").textContent = `${reportState.scores["Asset control"]}%`;
  document.getElementById("cashValue").textContent = `${reportState.scores["Cash-flow visibility"]}%`;
  document.getElementById("exitValue").textContent = `${reportState.scores["Exit liquidity"]}%`;
  document.getElementById("reputationValue").textContent = `${reportState.scores["Reputation safety"]}%`;
  document.getElementById("scenarioVerdict").textContent = verdict;
  document.getElementById("scoreNeedle").style.left = `${score}%`;
  document.getElementById("scenarioNarrative").textContent =
    score >= 78
      ? "This scenario starts to resemble a no-brainer institutional funding profile: strong evidence, controlled assets, visible cash flow, and reputation-safe governance."
      : score >= 64
        ? "This scenario is credible enough for deeper diligence, but still needs proof before capital commitment."
        : "This scenario remains a conversation-starter, not an investable package. The next move is evidence remediation, not term negotiation.";
  document.getElementById("openGates").innerHTML = gateList().map((gate) => `<li>${gate}</li>`).join("");
  document.getElementById("exitReadiness").textContent =
    reportState.scores["Exit liquidity"] >= 75 && reportState.scores["Evidence completeness"] >= 70
      ? "Exit-ready with buyer mapping"
      : "Needs institutional data room";
  updateHeader();
  renderScores();
  renderFinalReport();
  persistState();
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reportState));
}

function restoreState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    Object.assign(reportState, parsed);
    document.getElementById("dealName").value = reportState.dealName;
    document.getElementById("principal").value = reportState.principal;
    document.getElementById("assetClass").value = reportState.assetClass;
    document.getElementById("raiseSize").value = reportState.raiseSize;
    Object.entries(sliders).forEach(([label, slider]) => {
      slider.value = reportState.scores[label];
    });
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
    renderFinalReport();
    persistState();
  });
});

document.getElementById("runReport").addEventListener("click", () => {
  const button = document.getElementById("runReport");
  const status = document.getElementById("reportStatus");
  reportState.dealName = document.getElementById("dealName").value.trim() || "Untitled Deal";
  reportState.principal = document.getElementById("principal").value.trim() || "Principal";
  reportState.assetClass = document.getElementById("assetClass").value;
  reportState.raiseSize = document.getElementById("raiseSize").value.trim() || "Undisclosed raise";
  reportState.reportGenerated = true;
  button.disabled = true;
  button.textContent = "Reviewing evidence package...";
  status.textContent = "Building the fundability view from intake details and current scenario assumptions.";
  document.querySelector(".report-stage").classList.add("is-refreshing");
  window.setTimeout(() => {
    updateScenario();
    renderFinalReport(true);
    persistState();
    document.querySelector(".report-stage").classList.remove("is-refreshing");
    button.disabled = false;
    button.textContent = "Generate Fundability Report";
    status.textContent = `Report refreshed: ${weightedScore()} Fundability Index, ${verdictFor(weightedScore())}.`;
    document.querySelector(".report-stage").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 450);
});

Object.values(sliders).forEach((slider) => slider.addEventListener("input", updateScenario));

document.getElementById("sourcePackage").addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []).map((file) => file.name);
  document.getElementById("sourceFeedback").textContent = files.length
    ? `${files.length} file${files.length === 1 ? "" : "s"} selected: ${files.slice(0, 3).join(", ")}${files.length > 3 ? ", ..." : ""}. Analyst review occurs before final delivery.`
    : "Selected materials are reviewed by an analyst before final delivery.";
});

document.getElementById("copySummary").addEventListener("click", async () => {
  const score = weightedScore();
  const status = document.getElementById("copyStatus");
  const summary = `${reportState.dealName}\nPrepared for: ${reportState.principal}\nFundability Index: ${score}\nVerdict: ${verdictFor(score)}\nOpen gates:\n- ${gateList().join("\n- ")}`;
  await navigator.clipboard.writeText(summary);
  status.textContent = "Report summary copied to clipboard.";
  window.setTimeout(() => {
    status.textContent = "Exports are packaged as branded HTML/PDF report deliverables for client review.";
  }, 3500);
});

document.getElementById("resetApp").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
});

restoreState();
renderEvidence();
renderDiligence();
activateTab(document.querySelector(".tab-button.is-active"));
updateScenario();
renderFinalReport();
