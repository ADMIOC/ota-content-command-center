const reportState = {
  dealName: "Northstar Urban Partners CAD 120M Growth Capital Review",
  principal: "Atlas Ridge Capital Committee",
  assetClass: "Residential Infrastructure",
  raiseSize: "CAD 120M",
  mode: "Expert Review",
  scores: {
    "Capital absorption": 72,
    "Downside protection": 52,
    "Asset control": 40,
    "Cash-flow visibility": 45,
    "Sponsor bankability": 42,
    "Governance readiness": 45,
    "Policy alignment": 82,
    "Exit liquidity": 55,
    "Reputation safety": 45,
    "Evidence completeness": 40,
  },
};

const evidenceRows = [
  ["Market thesis", 82, "Strong"],
  ["Asset control", 20, "Weak"],
  ["Financial model", 12, "Absent"],
  ["Sponsor verification", 30, "Weak"],
  ["Exit path", 55, "Moderate"],
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

function updateHeader() {
  document.getElementById("reportTitle").textContent = reportState.dealName;
  document.getElementById("reportMeta").textContent = `Prepared for ${reportState.principal} - ${reportState.assetClass} - ${reportState.raiseSize}`;
  const score = weightedScore();
  document.getElementById("fundabilityScore").textContent = score;
  document.getElementById("verdictLabel").textContent = verdictFor(score);
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

function renderDiligence() {
  document.getElementById("ddList").innerHTML = ddItems.map((item) => `<li>${item}</li>`).join("");
  document.getElementById("questionList").innerHTML = questions
    .map((question) => `<button type="button">${question}</button>`)
    .join("");
  document.querySelectorAll(".question-list button").forEach((button) => {
    button.addEventListener("click", () => button.classList.toggle("is-selected"));
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
  persistState();
}

function persistState() {
  localStorage.setItem("dealflowCoachWorkspace", JSON.stringify(reportState));
}

function restoreState() {
  const saved = localStorage.getItem("dealflowCoachWorkspace");
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
  } catch {
    localStorage.removeItem("dealflowCoachWorkspace");
  }
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    document.getElementById(`tab-${button.dataset.tab}`).classList.add("is-active");
  });
});

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mode-button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    reportState.mode = button.dataset.mode;
    document.getElementById("modeNote").textContent = modeNotes[reportState.mode];
    persistState();
  });
});

document.getElementById("runReport").addEventListener("click", () => {
  reportState.dealName = document.getElementById("dealName").value.trim() || "Untitled Deal";
  reportState.principal = document.getElementById("principal").value.trim() || "Principal";
  reportState.assetClass = document.getElementById("assetClass").value;
  reportState.raiseSize = document.getElementById("raiseSize").value.trim() || "Undisclosed raise";
  updateHeader();
  persistState();
});

Object.values(sliders).forEach((slider) => slider.addEventListener("input", updateScenario));

document.getElementById("copySummary").addEventListener("click", async () => {
  const score = weightedScore();
  const summary = `${reportState.dealName}\nPrepared for: ${reportState.principal}\nFundability Index: ${score}\nVerdict: ${verdictFor(score)}\nOpen gates:\n- ${gateList().join("\n- ")}`;
  await navigator.clipboard.writeText(summary);
  document.getElementById("copyStatus").textContent = "Report summary copied to clipboard.";
});

document.getElementById("resetApp").addEventListener("click", () => {
  localStorage.removeItem("dealflowCoachWorkspace");
  window.location.reload();
});

restoreState();
renderEvidence();
renderDiligence();
updateScenario();
