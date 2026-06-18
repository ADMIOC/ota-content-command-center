const STORAGE_KEY = "rockElevenDealflowWorkspaceV5";

const reportState = {
  dealName: "",
  principal: "",
  assetClass: "",
  raiseSize: "",
  mode: "Expert Review",
  reportGenerated: false,
  sourceFiles: [],
  analysis: null,
};

const SOURCE_PACKAGE_PROMPT = "Attach the Source Package before generating a report. Source package details will populate below.";

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

const evidenceDimensions = [
  ["Market thesis", "marketThesis"],
  ["Asset control", "assetControl"],
  ["Financial model", "financialModel"],
  ["Sponsor verification", "sponsorVerification"],
  ["Exit path", "exitPath"],
];

const scoreLabels = {
  marketThesis: "Market thesis",
  assetControl: "Asset control",
  financialModel: "Financial model",
  sponsorVerification: "Sponsor verification",
  exitPath: "Exit path",
};

const signalLibrary = {
  marketThesis: ["market", "demand", "thesis", "growth", "location", "pipeline", "opportunity", "sector", "strategy"],
  assetControl: ["site control", "purchase agreement", "ownership", "title", "lease", "entitlement", "zoning", "permit", "collateral"],
  financialModel: ["financial model", "pro forma", "cash flow", "noi", "cap rate", "irr", "multiple", "waterfall", "debt", "dscr", "budget"],
  sponsorVerification: ["sponsor", "track record", "reference", "kyc", "aml", "management", "principal", "audited", "governance"],
  exitPath: ["exit", "buyer", "refinance", "sale", "stabilization", "takeout", "reits", "pension", "insurance", "strategic"],
};

const diligenceMap = {
  marketThesis: "Third-party market study, absorption support, and competitive set.",
  assetControl: "Executed site-control documents, title evidence, entitlement status, and enforceable purchase rights.",
  financialModel: "Full financial model with cost, rate, absorption, NOI, cap-rate, debt, and downside sensitivities.",
  sponsorVerification: "Sponsor track record schedule, KYC/AML package, references, governance, and related-party disclosures.",
  exitPath: "Exit buyer universe, refinancing comparables, portfolio roll-up logic, and takeout assumptions.",
};

function hasSourcePackage() {
  return reportState.sourceFiles.length > 0 && reportState.analysis;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function setText(id, value = "") {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function cleanPackageName(name = "") {
  return name
    .replace(/\.[^.]+$/g, "")
    .replace(/draft|final|copy|version|v\d+/gi, "")
    .replace(/\(\d+\)/g, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRaiseSize(text = "") {
  const match = text.match(/(?:CAD|USD|EUR|GBP|US\$|C\$|€|\$|£)\s?\d+(?:[.,]\d+)?\s?(?:M|MM|B|BN|million|billion)?/i);
  return match ? match[0].replace(/\s+/g, " ").trim() : "";
}

function extractSponsor(packageName = "", raiseSize = "") {
  let sponsor = packageName
    .replace(raiseSize, "")
    .replace(/[–—-]/g, " ")
    .replace(/\b(capital raise|raise|funding|deck|memo|package|investment|ic|committee|review)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!sponsor) sponsor = packageName.replace(/[–—-]/g, " ").trim();
  return sponsor || "Source Package";
}

function extractAssetClass(text = "") {
  const lower = text.toLowerCase();
  if (/(real estate|residential|multifamily|housing|development|property)/.test(lower)) return "Real Estate Development";
  if (/(infrastructure|energy|grid|storage|utility|transport)/.test(lower)) return "Infrastructure";
  if (/(private credit|credit|debt|loan)/.test(lower)) return "Private Credit";
  if (/(private equity|buyout|growth equity|equity)/.test(lower)) return "Private Equity";
  if (/(operating company|saas|platform|software|recurring revenue)/.test(lower)) return "Operating Company";
  if (/(capital raise|fundraise|raise)/.test(lower)) return "Capital Raise";
  return "";
}

function countSignals(text, words) {
  const lower = text.toLowerCase();
  return words.reduce((count, word) => count + (lower.includes(word) ? 1 : 0), 0);
}

function scoreFromSignals(signalCount, readableTextLength, hasRaiseSize) {
  const readableBonus = readableTextLength > 2000 ? 14 : readableTextLength > 500 ? 8 : readableTextLength > 50 ? 4 : 0;
  const raiseBonus = hasRaiseSize ? 4 : 0;
  return Math.min(92, 28 + signalCount * 10 + readableBonus + raiseBonus);
}

function ratingFor(score) {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Moderate";
  if (score >= 45) return "Weak";
  return "Absent";
}

function verdictFor(score) {
  if (score >= 78) return "Green Light Fundable";
  if (score >= 64) return "Advance Diligence";
  if (score >= 45) return "Engage - Do Not Commit";
  return "Do Not Advance";
}

function verdictTone(score) {
  if (score >= 78) return "is-green";
  if (score >= 64) return "is-gold";
  if (score >= 45) return "is-cabernet";
  return "is-red";
}

function buildAnalysis(files, readableText = "") {
  const fileNames = files.map((file) => file.name);
  const packageName = cleanPackageName(fileNames[0] || "Source Package");
  const corpus = `${fileNames.join(" ")} ${readableText}`.trim();
  const raiseSize = extractRaiseSize(corpus);
  const sponsor = extractSponsor(packageName, raiseSize);
  const assetClass = extractAssetClass(corpus);
  const scores = Object.fromEntries(
    Object.entries(signalLibrary).map(([key, words]) => [
      key,
      scoreFromSignals(countSignals(corpus, words), readableText.length, Boolean(raiseSize)),
    ]),
  );
  const fundabilityIndex = Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length);
  const weakKeys = Object.entries(scores)
    .filter(([, score]) => score < 65)
    .map(([key]) => key);

  return {
    fileNames,
    readableTextLength: readableText.length,
    dealName: `${sponsor} Institutional Fundability Review`,
    principal: `${sponsor} Capital Committee`,
    assetClass,
    raiseSize,
    scores,
    fundabilityIndex,
    verdict: verdictFor(fundabilityIndex),
    weakKeys,
  };
}

async function readSourcePackage(files) {
  const textChunks = await Promise.all(
    files.map(async (file) => {
      try {
        return await file.text();
      } catch {
        return "";
      }
    }),
  );
  return buildAnalysis(files, textChunks.join(" "));
}

function applyAnalysis(analysis) {
  reportState.analysis = analysis;
  reportState.sourceFiles = analysis.fileNames;
  reportState.dealName = analysis.dealName;
  reportState.principal = analysis.principal;
  reportState.assetClass = analysis.assetClass;
  reportState.raiseSize = analysis.raiseSize;
  reportState.reportGenerated = true;
  document.getElementById("dealName").value = reportState.dealName;
  document.getElementById("principal").value = reportState.principal;
  document.getElementById("assetClass").value = reportState.assetClass;
  document.getElementById("raiseSize").value = reportState.raiseSize;
}

function updateHeader() {
  setText("reportTitle", reportState.dealName);
  const meta = [reportState.principal, reportState.assetClass, reportState.raiseSize].filter(Boolean).join(" - ");
  setText("reportMeta", meta);
  const verdictCard = document.getElementById("verdictCard");
  verdictCard.classList.remove("is-green", "is-gold", "is-cabernet", "is-red");
  if (!hasSourcePackage()) {
    setText("fundabilityScore");
    setText("verdictLabel");
    return;
  }
  setText("fundabilityScore", reportState.analysis.fundabilityIndex);
  setText("verdictLabel", reportState.analysis.verdict);
  verdictCard.classList.add(verdictTone(reportState.analysis.fundabilityIndex));
}

function renderEvidence() {
  const map = document.getElementById("evidenceMap");
  if (!hasSourcePackage()) {
    map.innerHTML = "";
    return;
  }
  map.innerHTML = evidenceDimensions
    .map(([label, key]) => {
      const score = reportState.analysis.scores[key];
      return `
        <div class="evidence-row">
          <span>${escapeHtml(label)}</span>
          <b><i style="width: ${score}%"></i></b>
          <small>${ratingFor(score)} (${score})</small>
        </div>
      `;
    })
    .join("");
}

function thesisView() {
  const { scores, fundabilityIndex, verdict, assetClass, raiseSize, readableTextLength } = reportState.analysis;
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const scope = [assetClass, raiseSize].filter(Boolean).join(" / ") || "source package";
  const dataCaveat =
    readableTextLength < 500
      ? "The current package provides limited machine-readable evidence, so the thesis remains conditional on full document review."
      : "The source package provides enough readable signals to establish an initial institutional thesis posture.";

  return {
    title: `${verdict}: ${scope}`,
    body: `${dataCaveat} Strongest source signal: ${scoreLabels[strongest[0]]} (${strongest[1]}/100). Primary fundability constraint: ${scoreLabels[weakest[0]]} (${weakest[1]}/100). Current source-package posture is ${fundabilityIndex}/100 before analyst confirmation.`,
  };
}

function renderThesis() {
  if (!hasSourcePackage()) {
    setText("coreThesisTitle");
    setText("coreThesisBody");
    return;
  }
  const thesis = thesisView();
  setText("coreThesisTitle", thesis.title);
  setText("coreThesisBody", thesis.body);
}

function renderScores() {
  const grid = document.getElementById("scoreGrid");
  if (!hasSourcePackage()) {
    grid.innerHTML = "";
    return;
  }
  grid.innerHTML = Object.entries(reportState.analysis.scores)
    .map(([key, score]) => `
      <article class="score-card">
        <strong>${score}</strong>
        <span>${escapeHtml(scoreLabels[key])}</span>
        <p>${ratingFor(score)} source-package signal.</p>
      </article>
    `)
    .join("");
}

function reportPosture() {
  const { fundabilityIndex, verdict, readableTextLength } = reportState.analysis;
  if (fundabilityIndex >= 78) {
    return `${verdict}. Source-package signals indicate institutional review readiness, subject to legal, KYC, model, and committee confirmation.`;
  }
  if (fundabilityIndex >= 64) {
    return `${verdict}. Source-package signals support continued diligence, but capital commitment remains conditional on closing the weakest evidence categories.`;
  }
  if (readableTextLength < 500) {
    return `${verdict}. The package provides limited machine-readable evidence. Treat this as a document-quality warning until the full IC package is available.`;
  }
  return `${verdict}. The package does not yet clear institutional capital standards without material evidence remediation.`;
}

function openRiskGates() {
  if (!hasSourcePackage()) return [];
  return reportState.analysis.weakKeys.map((key) => `${scoreLabels[key]} is below institutional committee threshold.`);
}

function diligencePriorities() {
  if (!hasSourcePackage()) return [];
  const keys = reportState.analysis.weakKeys.length ? reportState.analysis.weakKeys : Object.keys(diligenceMap).slice(0, 3);
  return keys.map((key) => diligenceMap[key]);
}

function renderFinalReport() {
  const title = document.getElementById("finalReportTitle");
  const badge = document.getElementById("finalReportBadge");
  const body = document.getElementById("finalReportBody");
  if (!title || !badge || !body) return;

  title.textContent = "";
  badge.textContent = "";
  body.innerHTML = "";
  if (!hasSourcePackage()) return;

  const generatedAt = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const gates = openRiskGates();
  const priorities = diligencePriorities();

  title.textContent = reportState.dealName;
  badge.textContent = `${reportState.analysis.fundabilityIndex} / ${reportState.analysis.verdict}`;
  body.innerHTML = `
    <div class="report-summary-grid">
      <div>
        <strong>Prepared for</strong>
        <span>${escapeHtml(reportState.principal)}</span>
      </div>
      <div>
        <strong>Asset class</strong>
        <span>${escapeHtml(reportState.assetClass || "Not identified in source")}</span>
      </div>
      <div>
        <strong>Raise size</strong>
        <span>${escapeHtml(reportState.raiseSize || "Not identified in source")}</span>
      </div>
      <div>
        <strong>Generated</strong>
        <span>${generatedAt}</span>
      </div>
    </div>
    <section>
      <h5>Executive verdict</h5>
      <p>${escapeHtml(thesisView().body)}</p>
    </section>
    <section>
      <h5>Evidence map</h5>
      <ul>${evidenceDimensions.map(([label, key]) => `<li>${escapeHtml(label)}: ${ratingFor(reportState.analysis.scores[key])} (${reportState.analysis.scores[key]}/100)</li>`).join("")}</ul>
    </section>
    <section>
      <h5>Open risk gates</h5>
      ${gates.length ? `<ul>${gates.map((gate) => `<li>${escapeHtml(gate)}</li>`).join("")}</ul>` : "<p>No critical open gates detected from the source-package signals.</p>"}
    </section>
    <section>
      <h5>Diligence priorities</h5>
      <ol>${priorities.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </section>
    <section>
      <h5>Source package</h5>
      <p>${escapeHtml(reportState.sourceFiles.join(", "))}</p>
    </section>
  `;
}

function renderDiligence() {
  const ddList = document.getElementById("ddList");
  const questionList = document.getElementById("questionList");
  if (!hasSourcePackage()) {
    ddList.innerHTML = "";
    questionList.innerHTML = "";
    return;
  }
  ddList.innerHTML = diligencePriorities().map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  questionList.innerHTML = openRiskGates().map((question) => `<button type="button">${escapeHtml(question)}</button>`).join("");
}

function renderScenarioLab() {
  if (!hasSourcePackage()) {
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
    return;
  }

  const scores = reportState.analysis.scores;
  const controls = [
    ["evidenceValue", "evidenceSlider", scores.marketThesis],
    ["controlValue", "controlSlider", scores.assetControl],
    ["cashValue", "cashSlider", scores.financialModel],
    ["exitValue", "exitSlider", scores.exitPath],
    ["reputationValue", "reputationSlider", scores.sponsorVerification],
  ];
  controls.forEach(([valueId, sliderId, score]) => {
    setText(valueId, `${score}%`);
    const slider = document.getElementById(sliderId);
    slider.value = score;
    slider.disabled = true;
  });
  setText("scenarioVerdict", reportState.analysis.verdict);
  setText("scenarioNarrative", reportPosture());
  document.getElementById("scoreNeedle").style.left = `${reportState.analysis.fundabilityIndex}%`;
  document.getElementById("openGates").innerHTML = openRiskGates().map((gate) => `<li>${escapeHtml(gate)}</li>`).join("");
  setText("exitReadiness", scores.exitPath >= 65 ? "Exit path identified in source package" : "Exit path not yet institutional-grade");
}

function renderWorkspace() {
  updateHeader();
  renderThesis();
  renderEvidence();
  renderScores();
  renderScenarioLab();
  renderDiligence();
  renderFinalReport();
  persistState();
}

function clearWorkspace() {
  localStorage.removeItem(STORAGE_KEY);
  reportState.dealName = "";
  reportState.principal = "";
  reportState.assetClass = "";
  reportState.raiseSize = "";
  reportState.reportGenerated = false;
  reportState.sourceFiles = [];
  reportState.analysis = null;
  document.getElementById("dealName").value = "";
  document.getElementById("principal").value = "";
  document.getElementById("assetClass").value = "";
  document.getElementById("raiseSize").value = "";
  document.getElementById("sourcePackage").value = "";
  document.getElementById("sourceFeedback").textContent = SOURCE_PACKAGE_PROMPT;
  document.getElementById("reportStatus").textContent = "";
  document.getElementById("copyStatus").textContent = "Exports are packaged only after source-package review.";
  document.getElementById("runReport").disabled = false;
  renderWorkspace();
}

function exportLines() {
  if (!hasSourcePackage()) return [];
  const gates = openRiskGates();
  const priorities = diligencePriorities();
  return [
    reportState.dealName,
    "",
    `Prepared for: ${reportState.principal}`,
    `Asset class: ${reportState.assetClass || "Not identified in source"}`,
    `Raise size: ${reportState.raiseSize || "Not identified in source"}`,
    `Fundability Index: ${reportState.analysis.fundabilityIndex}`,
    `Verdict: ${reportState.analysis.verdict}`,
    `Source package: ${reportState.sourceFiles.join(", ")}`,
    "",
    "Core Thesis",
    thesisView().body,
    "",
    "Evidence Map",
    ...evidenceDimensions.map(([label, key]) => `${label}: ${ratingFor(reportState.analysis.scores[key])} (${reportState.analysis.scores[key]}/100)`),
    "",
    "Open Risk Gates",
    ...(gates.length ? gates : ["No critical open gates detected from the source-package signals."]),
    "",
    "Diligence Priorities",
    ...priorities.map((item, index) => `${index + 1}. ${item}`),
  ];
}

function exportFileName(extension) {
  const slug = (reportState.dealName || "fundability-report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${slug || "fundability-report"}.${extension}`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function concatBytes(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function writeUint16(value) {
  return new Uint8Array([value & 255, (value >>> 8) & 255]);
}

function writeUint32(value) {
  return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  files.forEach(({ name, content }) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const localHeader = concatBytes([
      writeUint32(0x04034b50), writeUint16(20), writeUint16(0), writeUint16(0), writeUint16(0), writeUint16(0),
      writeUint32(crc), writeUint32(data.length), writeUint32(data.length), writeUint16(nameBytes.length), writeUint16(0), nameBytes,
    ]);
    localParts.push(localHeader, data);
    centralParts.push(concatBytes([
      writeUint32(0x02014b50), writeUint16(20), writeUint16(20), writeUint16(0), writeUint16(0), writeUint16(0), writeUint16(0),
      writeUint32(crc), writeUint32(data.length), writeUint32(data.length), writeUint16(nameBytes.length), writeUint16(0), writeUint16(0),
      writeUint16(0), writeUint16(0), writeUint32(0), writeUint32(offset), nameBytes,
    ]));
    offset += localHeader.length + data.length;
  });
  const central = concatBytes(centralParts);
  return concatBytes([
    ...localParts,
    central,
    writeUint32(0x06054b50), writeUint16(0), writeUint16(0), writeUint16(files.length), writeUint16(files.length),
    writeUint32(central.length), writeUint32(offset), writeUint16(0),
  ]);
}

function buildDocxBlob() {
  const xmlText = exportLines()
    .map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeHtml(line)}</w:t></w:r></w:p>`)
    .join("");
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${xmlText}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr></w:body></w:document>`;
  const bytes = zipStore([
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
    { name: "word/document.xml", content: documentXml },
  ]);
  return new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

function pdfEscape(text) {
  return String(text).replace(/[\\()]/g, "\\$&");
}

function buildPdfBlob() {
  const lines = exportLines().flatMap((line) => {
    const chunks = [];
    for (let index = 0; index < line.length || index === 0; index += 92) chunks.push(line.slice(index, index + 92));
    return chunks;
  });
  const pages = [];
  for (let index = 0; index < lines.length; index += 48) pages.push(lines.slice(index, index + 48));
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>"];
  const pageRefs = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects.push(`<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`);
  pages.forEach((pageLines, index) => {
    const pageObject = 3 + index * 2;
    const streamObject = pageObject + 1;
    const stream = `BT /F1 11 Tf 50 760 Td 14 TL ${pageLines.map((line) => `(${pdfEscape(line)}) Tj T*`).join(" ")} ET`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${streamObject} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function requireReportForExport() {
  if (hasSourcePackage()) return true;
  document.getElementById("copyStatus").textContent = "Generate a report from a Source Package before exporting.";
  return false;
}

function persistState() {
  const stateToPersist = { ...reportState, sourceFiles: [], analysis: null, reportGenerated: false };
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
    reportState.analysis = null;
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
    reportState[id] = document.getElementById(id).value.trim();
    persistState();
  });
});

document.getElementById("runReport").addEventListener("click", () => {
  if (!hasSourcePackage()) {
    document.getElementById("reportStatus").textContent = "Attach a Source Package before generating a report.";
    renderWorkspace();
  }
});

document.getElementById("sourcePackage").addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    reportState.sourceFiles = [];
    reportState.analysis = null;
    reportState.reportGenerated = false;
    document.getElementById("sourceFeedback").textContent = SOURCE_PACKAGE_PROMPT;
    renderWorkspace();
    return;
  }

  const status = document.getElementById("reportStatus");
  status.textContent = "Reading Source Package and generating the institutional fundability report.";
  document.getElementById("runReport").disabled = true;
  reportState.sourceFiles = files.map((file) => file.name);
  document.getElementById("sourceFeedback").textContent = `${files.length} source file${files.length === 1 ? "" : "s"} selected: ${reportState.sourceFiles.slice(0, 3).join(", ")}${files.length > 3 ? ", ..." : ""}.`;
  const analysis = await readSourcePackage(files);
  applyAnalysis(analysis);
  renderWorkspace();
  document.getElementById("runReport").disabled = false;
  status.textContent = `Report generated from Source Package: ${analysis.fundabilityIndex} Fundability Index, ${analysis.verdict}.`;
  document.querySelector(".report-stage").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("copySummary").addEventListener("click", async () => {
  if (!requireReportForExport()) return;
  const status = document.getElementById("copyStatus");
  await navigator.clipboard.writeText(exportLines().join("\n"));
  status.textContent = "Report summary copied to clipboard.";
  window.setTimeout(() => {
    status.textContent = "Exports are packaged only after source-package review.";
  }, 3500);
});

document.getElementById("downloadDocx").addEventListener("click", () => {
  if (!requireReportForExport()) return;
  downloadBlob(buildDocxBlob(), exportFileName("docx"));
  document.getElementById("copyStatus").textContent = "DOCX report downloaded.";
});

document.getElementById("downloadPdf").addEventListener("click", () => {
  if (!requireReportForExport()) return;
  downloadBlob(buildPdfBlob(), exportFileName("pdf"));
  document.getElementById("copyStatus").textContent = "PDF report downloaded.";
});

document.getElementById("resetWorkspace").addEventListener("click", clearWorkspace);

restoreState();
activateTab(document.querySelector(".tab-button.is-active"));
renderWorkspace();
