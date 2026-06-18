const BASE_SCORE = 5.1;
const TARGET_PORTFOLIO = 2000;

const scorecardData = [
  ["Market opportunity", 8.0, "Structural deficit real; Halifax catalysts verifiable."],
  ["Thesis coherence", 6.5, "Logical strategy; FX framing is overweighted."],
  ["Asset quality", 7.0, "Ocean Breeze attractive, but not controlled."],
  ["Sponsor credibility", 4.0, "Strong bios, no verification package."],
  ["Financial substantiation", 1.5, "No model, terms, or structure."],
  ["Execution readiness", 4.5, "Shovel-ready claims offset by modular and control unknowns."],
  ["Composite", 5.1, "Engage - do not commit."],
];

const controls = {
  fxRate: document.getElementById("fxRate"),
  ltv: document.getElementById("ltv"),
  overrun: document.getElementById("overrun"),
  noiYield: document.getElementById("noiYield"),
  capRate: document.getElementById("capRate"),
  evidence: document.getElementById("evidence"),
};

const output = {
  fxValue: document.getElementById("fxValue"),
  ltvValue: document.getElementById("ltvValue"),
  overrunValue: document.getElementById("overrunValue"),
  yieldValue: document.getElementById("yieldValue"),
  capValue: document.getElementById("capValue"),
  evidenceValue: document.getElementById("evidenceValue"),
  cadEquity: document.getElementById("cadEquity"),
  portfolioValue: document.getElementById("portfolioValue"),
  targetGap: document.getElementById("targetGap"),
  icPosture: document.getElementById("icPosture"),
  heroScore: document.getElementById("heroScore"),
  liveScore: document.getElementById("liveScore"),
  scoreNeedle: document.getElementById("scoreNeedle"),
  bridgeNote: document.getElementById("bridgeNote"),
  scoreNote: document.getElementById("scoreNote"),
  riskGate: document.getElementById("riskGate"),
  riskGateList: document.getElementById("riskGateList"),
  equityBar: document.getElementById("equityBar"),
  capacityBar: document.getElementById("capacityBar"),
  valueBar: document.getElementById("valueBar"),
};

function money(value) {
  if (value >= 1000) {
    return `CAD ${(value / 1000).toFixed(2)}B`;
  }
  return `CAD ${Math.round(value)}M`;
}

function getScenario() {
  return {
    fxRate: Number(controls.fxRate.value),
    ltv: Number(controls.ltv.value) / 100,
    overrun: Number(controls.overrun.value) / 100,
    noiYield: Number(controls.noiYield.value) / 100,
    capRate: Number(controls.capRate.value) / 100,
    evidence: Number(controls.evidence.value) / 100,
  };
}

function computeScenario(values) {
  const cadEquity = 150 * values.fxRate;
  const leveredCapacity = cadEquity / Math.max(0.1, 1 - values.ltv);
  const adjustedCost = leveredCapacity / (1 + values.overrun);
  const annualNoi = adjustedCost * values.noiYield;
  const capRateValue = annualNoi / values.capRate;
  const modeledPortfolio = Math.min(capRateValue, adjustedCost * 1.25);
  const targetRatio = modeledPortfolio / TARGET_PORTFOLIO;

  const evidenceLift = values.evidence * 2.2;
  const financialLift = (targetRatio - 0.37) * 1.2;
  const overrunPenalty = (values.overrun - 0.1) * 1.4;
  const ltvPenalty = Math.max(0, values.ltv - 0.75) * 3;
  const score = Math.max(1, Math.min(8.2, BASE_SCORE + evidenceLift + financialLift - overrunPenalty - ltvPenalty));

  return {
    cadEquity,
    leveredCapacity,
    adjustedCost,
    capRateValue,
    modeledPortfolio,
    score,
    targetRatio,
  };
}

function posture(score, evidence, targetRatio) {
  if (score >= 7.1 && evidence >= 0.8 && targetRatio >= 0.85) return "Proceed to terms";
  if (score >= 6.2 && evidence >= 0.55) return "Advance diligence";
  if (score >= 4.8) return "Engage - Do Not Commit";
  return "Do Not Advance";
}

function riskItems(values, computed) {
  const open = [];
  if (values.evidence < 0.35) open.push("Sponsor track record remains unverified.");
  if (values.evidence < 0.55) open.push("Ocean Breeze site control remains unresolved.");
  if (values.evidence < 0.75) open.push("Financial model and fund terms remain missing.");
  if (computed.targetRatio < 0.8) open.push("Modeled portfolio remains materially below CAD 2.0B.");
  if (values.overrun >= 0.18) open.push("Construction overrun assumptions pressure the bridge.");
  if (values.ltv > 0.78) open.push("Higher leverage increases refinancing and rate exposure.");
  return open;
}

function renderScorecard() {
  const scorecard = document.getElementById("scorecard");
  scorecard.innerHTML = scorecardData
    .map(
      ([label, score, basis]) => `
        <article class="score-item">
          <strong>${score.toFixed(1)}</strong>
          <span>${label}</span>
          <p>${basis}</p>
          <div class="score-rail" aria-hidden="true"><b style="width: ${score * 10}%"></b></div>
        </article>
      `,
    )
    .join("");
}

function updateScenario() {
  const values = getScenario();
  const computed = computeScenario(values);
  const livePosture = posture(computed.score, values.evidence, computed.targetRatio);
  const openRisks = riskItems(values, computed);

  output.fxValue.textContent = values.fxRate.toFixed(2);
  output.ltvValue.textContent = `${Math.round(values.ltv * 100)}%`;
  output.overrunValue.textContent = `${Math.round(values.overrun * 100)}%`;
  output.yieldValue.textContent = `${(values.noiYield * 100).toFixed(1)}%`;
  output.capValue.textContent = `${(values.capRate * 100).toFixed(1)}%`;
  output.evidenceValue.textContent = `${Math.round(values.evidence * 100)}%`;

  output.cadEquity.textContent = money(computed.cadEquity);
  output.portfolioValue.textContent = money(computed.modeledPortfolio);
  const gap = computed.modeledPortfolio - TARGET_PORTFOLIO;
  output.targetGap.textContent = gap >= 0 ? `${money(gap)} excess` : `${money(Math.abs(gap))} short`;
  output.icPosture.textContent = livePosture;

  output.heroScore.textContent = computed.score.toFixed(1);
  output.liveScore.textContent = `${computed.score.toFixed(1)} / 10`;
  output.scoreNeedle.style.left = `${computed.score * 10}%`;

  output.equityBar.style.width = `${Math.min(100, (computed.cadEquity / TARGET_PORTFOLIO) * 100)}%`;
  output.capacityBar.style.width = `${Math.min(100, (computed.adjustedCost / TARGET_PORTFOLIO) * 100)}%`;
  output.valueBar.style.width = `${Math.min(100, (computed.modeledPortfolio / TARGET_PORTFOLIO) * 100)}%`;

  output.bridgeNote.textContent = `Base math converts EUR 150M into ${money(computed.cadEquity)} of equity, then applies effective leverage, overruns, NOI yield, and cap-rate valuation. The memo itself did not provide this bridge.`;
  output.scoreNote.textContent = `The score improves only when evidence gaps close and the modeled bridge approaches the CAD 2.0B target. High leverage and overruns pull it back down.`;
  output.riskGate.textContent = `${openRisks.length} open risk ${openRisks.length === 1 ? "gate" : "gates"}`;
  output.riskGateList.innerHTML = openRisks.map((item) => `<li>${item}</li>`).join("");
}

Object.values(controls).forEach((control) => {
  control.addEventListener("input", updateScenario);
});

document.getElementById("resetScenario").addEventListener("click", () => {
  controls.fxRate.value = "1.50";
  controls.ltv.value = "75";
  controls.overrun.value = "10";
  controls.noiYield.value = "5.0";
  controls.capRate.value = "5.5";
  controls.evidence.value = "0";
  updateScenario();
});

document.querySelectorAll(".question-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-selected");
  });
});

renderScorecard();
updateScenario();
