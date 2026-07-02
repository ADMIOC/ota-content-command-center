import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import "../social-profiles.css";
import "./phase2.css";
import { platformCatalog, platformGuidance, restreamPlatforms } from "./socialEngineData.js";

const api = {
  async state() {
    return request("/api/state");
  },
  async deploymentStatus() {
    return request("/api/deployment/status");
  },
  async reset() {
    return request("/api/state/reset", { method: "POST" });
  },
  async setActiveRole(body) {
    return request("/api/governance/active-role", { method: "PATCH", body });
  },
  async patchProfile(profileId, body) {
    return request(`/api/profiles/${profileId}`, { method: "PATCH", body });
  },
  async addAsset(profileId, body) {
    return request(`/api/profiles/${profileId}/assets`, { method: "POST", body });
  },
  async uploadAsset(profileId, formData) {
    return requestForm(`/api/profiles/${profileId}/assets/upload`, formData);
  },
  async scanPlatformAssets(profileId) {
    return request(`/api/profiles/${profileId}/platform-scan`, { method: "POST", body: {} });
  },
  async patchRestream(profileId, body) {
    return request(`/api/profiles/${profileId}/restream-candidate`, { method: "PATCH", body });
  },
  async storeSecret(profileId, body) {
    return request(`/api/profiles/${profileId}/secrets`, { method: "POST", body });
  },
  async dryRunRestream(candidateId) {
    return request(`/api/restream/candidates/${candidateId}/dry-run`, { method: "POST", body: {} });
  },
  async submitRestream(candidateId) {
    return request(`/api/restream/candidates/${candidateId}/submit`, { method: "POST", body: {} });
  },
  async refreshRestreamOAuth(candidateId) {
    return request(`/api/restream/candidates/${candidateId}/oauth/refresh`, { method: "POST", body: {} });
  },
  async startRestreamOAuth(candidateId) {
    return request(`/api/restream/candidates/${candidateId}/oauth/authorize-url`);
  },
  async validateRestreamChannels(candidateId) {
    return request(`/api/restream/candidates/${candidateId}/channels`);
  },
  async approveRestream(profileId) {
    return request(`/api/profiles/${profileId}/restream-candidate/approve`, { method: "POST", body: {} });
  }
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `${response.status} ${response.statusText}`);
  return payload;
}

async function requestForm(url, formData) {
  const response = await fetch(url, {
    method: "POST",
    body: formData
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function formatLabel(value = "") {
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPlatform(platformKey) {
  return platformCatalog.find((platform) => platform.key === platformKey);
}

function formatDateTime(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function buildRestreamPayload(profile) {
  const candidate = profile?.restreamCandidate || {};
  const payload = {
    endpoint: "POST https://api.restream.io/v2/user/channels",
    requiredScope: "channels.write",
    approvalState: candidate.approvalState || "draft",
    body: {
      platformId: Number(candidate.platformId) || null,
      displayName: candidate.displayName || `${getPlatform(profile.platformKey)?.name || "Channel"} destination`
    },
    secretRefs: {}
  };
  if (candidate.streamUrlSecretRef) payload.secretRefs.streamUrl = candidate.streamUrlSecretRef;
  if (candidate.streamKeySecretRef) payload.secretRefs.streamKey = candidate.streamKeySecretRef;
  if (candidate.rtmpUsernameSecretRef) payload.secretRefs.rtmpUsername = candidate.rtmpUsernameSecretRef;
  if (candidate.rtmpPasswordSecretRef) payload.secretRefs.rtmpPassword = candidate.rtmpPasswordSecretRef;
  if (candidate.instagramUsername) payload.body.instagramUsername = candidate.instagramUsername;
  return payload;
}

function readinessScore(profile) {
  if (!profile) return 0;
  const required = getPlatform(profile.platformKey)?.required || [];
  const requiredComplete = required.filter((field) => isComplete(profile, field)).length;
  const stateComplete = [
    profile.ownershipState === "ownership_claimed",
    profile.securityState === "verified",
    profile.profileState === "ready"
  ].filter(Boolean).length;
  return Math.round(((requiredComplete + stateComplete) / (required.length + 3)) * 100);
}

function recommendedSection(profile) {
  if (profile.blockedReason) return "blocker";
  if (!profile.actualHandle || !profile.profileUrl || !profile.displayName || !profile.bio) return "profile";
  if (!profile.platformScan && !(profile.mediaAssets || []).length) return "assets";
  if (profile.platformKey === "instagram" && !profile.restreamCandidate?.streamKeySecretRef) return "restream";
  return "profile";
}

function sectionLabel(section) {
  return {
    blocker: "Operational Blocker",
    profile: "Step 1 Profile",
    assets: "Step 2 Assets",
    restream: "Step 3 Restream"
  }[section] || "Step 1 Profile";
}

function rolePermissions(governance) {
  return new Set(governance?.roles?.[governance?.activeRole]?.permissions || []);
}

function can(governance, permission) {
  return rolePermissions(governance).has(permission);
}

function isComplete(profile, field) {
  return Boolean(profile[field] && profile[field] !== "unknown");
}

function App() {
  const [state, setState] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.state().then((next) => {
      setState(next);
      setSelectedBrandId(next.selectedBrandId || next.brands?.[0]?.id || "");
      setSelectedProfileId(next.selectedProfileId || next.profiles?.[0]?.id || "");
    }).catch((err) => setError(err.message));
    api.deploymentStatus().then(setDeployment).catch(() => setDeployment(null));
  }, []);

  const selectedBrand = state?.brands.find((brand) => brand.id === selectedBrandId);
  const selectedProfile = state?.profiles.find((profile) => profile.id === selectedProfileId);

  const profilesForBrand = useMemo(() => {
    if (!state) return [];
    return state.profiles
      .filter((profile) => profile.brandId === selectedBrandId)
      .filter((profile) => {
        const platform = getPlatform(profile.platformKey);
        const text = `${platform?.name || ""} ${profile.targetHandle || ""} ${profile.actualHandle || ""} ${profile.displayName || ""}`.toLowerCase();
        if (search && !text.includes(search.toLowerCase())) return false;
        if (filter === "human_action_required") return profile.ownershipState === "human_action_required";
        if (filter === "connector_candidate") return profile.connectorState === "candidate";
        if (filter === "restream_ready") return profile.restreamCandidate?.approvalState === "approved";
        if (filter === "blocked") return profile.blocked || profile.publishingState === "blocked";
        return true;
      });
  }, [state, selectedBrandId, search, filter]);

  function replaceState(next) {
    setState(next);
  }

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2200);
  }

  async function resetState() {
    const next = await api.reset();
    setState(next);
    setSelectedBrandId(next.selectedBrandId);
    setSelectedProfileId(next.selectedProfileId);
    showToast("Phase 8 state reset");
  }

  async function setActiveRole(activeRole) {
    const next = await api.setActiveRole({ activeRole });
    setState(next);
    showToast(`Active role set to ${next.governance.roles[activeRole].label}`);
  }

  async function refreshDeploymentGate() {
    try {
      const next = await api.deploymentStatus();
      setDeployment(next);
      showToast(next.readyForHostedProduction ? "Deployment gate is clear" : `${next.blockers?.length || 0} blocker(s) still open`);
    } catch (err) {
      showToast(err.message);
    }
  }

  if (!state) {
    return <div className="app-shell social-app phase2-loading"><h1>OTA Social Engine</h1><p>{error || "Loading app state..."}</p></div>;
  }

  const readyCount = state.profiles.filter((profile) => profile.profileState === "ready").length;
  const blockedCount = state.profiles.filter((profile) => profile.blocked || profile.publishingState === "blocked").length;

  return (
    <div className="app-shell social-app">
      <header className="topbar">
        <div>
          <p className="eyebrow">OTA Social Engine</p>
          <h1>Social Profile by Brand</h1>
          <small className="phase2-badge">Phase 9A deployment blindspot gate</small>
        </div>
        <div className="top-actions">
          {state.governance ? (
            <label className="field role-field">
              <span>Active Role</span>
              <select value={state.governance.activeRole} onChange={(event) => setActiveRole(event.target.value)}>
                {Object.entries(state.governance.roles).map(([key, role]) => <option key={key} value={key}>{role.label}</option>)}
              </select>
            </label>
          ) : null}
          <a className="ghost-button top-link" href="https://app.notion.com/p/38fa90a45ed78194ad95d43d43d39d4f" target="_blank" rel="noreferrer">Notion Control Plane</a>
          <a className="ghost-button top-link" href="/social-profiles.html">Static MVP</a>
          <button className="ghost-button" type="button" onClick={resetState}>Reset App State</button>
        </div>
      </header>

      <main className="social-workspace">
        <aside className="brand-rail" aria-label="Brand profiles">
          <section className="metric-strip" aria-label="Social profile summary">
            <div><strong>{state.brands.length}</strong><span>Brands</span></div>
            <div><strong>{readyCount}</strong><span>Ready</span></div>
            <div><strong>{blockedCount}</strong><span>Blocked</span></div>
          </section>

          <section className="panel compact-panel">
            <label className="field">
              <span>Brand</span>
              <select value={selectedBrandId} onChange={(event) => {
                const brandId = event.target.value;
                setSelectedBrandId(brandId);
                setSelectedProfileId(state.profiles.find((profile) => profile.brandId === brandId)?.id || "");
              }}>
                {state.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Search Platforms</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" autoComplete="off" />
            </label>
            <label className="field">
              <span>Readiness Filter</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">All States</option>
                <option value="human_action_required">Human Action Required</option>
                <option value="connector_candidate">Connector Candidate</option>
                <option value="restream_ready">Restream Ready</option>
                <option value="blocked">Blocked</option>
              </select>
            </label>
          </section>

          <nav className="profile-list" aria-label="Platform profiles">
            {profilesForBrand.map((profile) => (
              <button key={profile.id} className={`profile-button ${profile.id === selectedProfileId ? "active" : ""}`} type="button" onClick={() => setSelectedProfileId(profile.id)}>
                <strong>{getPlatform(profile.platformKey)?.name || profile.platformKey}</strong>
                <small>{profile.actualHandle || profile.targetHandle || "No handle yet"}</small>
                <span className={`status-pill ${profile.profileState === "ready" ? "approved" : "needs-approval"}`}>{formatLabel(profile.profileState)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {selectedProfile ? (
          <ProfileWorkspace
            brand={selectedBrand}
            profile={selectedProfile}
            governance={state.governance}
            deployment={deployment}
            refreshDeploymentGate={refreshDeploymentGate}
            replaceState={replaceState}
            showToast={showToast}
          />
        ) : (
          <section className="social-content"><section className="empty-state"><h2>No platform profile selected</h2></section></section>
        )}
      </main>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

function ProfileWorkspace({ brand, profile, governance, deployment, refreshDeploymentGate, replaceState, showToast }) {
  const [draft, setDraft] = useState(profile);
  const [activeSection, setActiveSection] = useState(recommendedSection(profile));
  const guidance = platformGuidance[profile.platformKey] || platformGuidance.youtube;
  const score = readinessScore(profile);

  useEffect(() => {
    setDraft(profile);
    const nextSection = recommendedSection(profile);
    setActiveSection(nextSection);
    window.setTimeout(() => focusSection(nextSection), 120);
  }, [profile]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function focusSection(section) {
    setActiveSection(section);
    const target = document.querySelector(`[data-guide-section="${section}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveProfile() {
    const { state } = await api.patchProfile(profile.id, {
      targetHandle: draft.targetHandle,
      actualHandle: draft.actualHandle,
      profileUrl: draft.profileUrl,
      displayName: draft.displayName,
      bio: draft.bio,
      websiteUrl: draft.websiteUrl,
      businessAccountStatus: draft.businessAccountStatus,
      profileImageAsset: draft.profileImageAsset,
      bannerAsset: draft.bannerAsset,
      notes: draft.notes,
      blockedReason: draft.blockedReason,
      nextAction: draft.nextAction
    });
    replaceState(state);
    showToast("Profile saved through API");
  }

  async function addAsset() {
    const assetName = window.prompt("Asset name");
    if (!assetName) return;
    const { state } = await api.addAsset(profile.id, {
      assetName,
      assetType: "document",
      fileName: "",
      width: "",
      height: "",
      description: "Added from Phase 4 app shell as metadata only. Use Upload Asset for managed file storage.",
      usageContext: "Profile construct asset placeholder",
      approvalState: "needs_review"
    });
    replaceState(state);
    showToast("Asset recorded through API");
  }

  async function uploadAsset(formData) {
    const platformAssetUrl = formData.get("platformAssetUrl");
    const file = formData.get("file");
    const hasFile = file && typeof file === "object" && file.name;
    const payload = {
      assetType: formData.get("assetType"),
      assetName: formData.get("assetName"),
      usageContext: formData.get("usageContext"),
      description: formData.get("description"),
      platformAssetUrl,
      publicUrl: platformAssetUrl,
      platformStatus: formData.get("platformStatus"),
      sourceSystem: platformAssetUrl ? "platform_observed" : "local_upload_pending",
      approvalState: "needs_review"
    };
    const { state } = hasFile ? await api.uploadAsset(profile.id, formData) : await api.addAsset(profile.id, payload);
    replaceState(state);
    showToast(hasFile ? "Media file uploaded through Phase 4 storage" : "Platform asset recorded for review");
  }

  async function scanPlatformAssets() {
    try {
      const result = await api.scanPlatformAssets(profile.id);
      replaceState(result.state);
      showToast(`${result.assets.length} new platform asset(s) surfaced`);
    } catch (error) {
      showToast(error.message);
    }
  }

  async function saveRestream(candidate) {
    const { state } = await api.patchRestream(profile.id, candidate);
    replaceState(state);
    showToast("Restream candidate saved through API");
  }

  async function storeSecret(credentialType, value) {
    const { state } = await api.storeSecret(profile.id, { credentialType, value });
    replaceState(state);
    showToast(`${formatLabel(credentialType)} stored as secret reference`);
  }

  async function approveRestream() {
    const { state } = await api.approveRestream(profile.id);
    replaceState(state);
    showToast("Candidate approved for dry run and submit checks");
  }

  async function dryRunRestream() {
    const candidateId = profile.restreamCandidate?.id || `candidate-${profile.id}`;
    const result = await api.dryRunRestream(candidateId);
    showToast(result.ok ? "Dry run passed" : "Dry run generated with blockers");
  }

  async function submitRestream() {
    const candidateId = profile.restreamCandidate?.id || `candidate-${profile.id}`;
    try {
      const { state } = await api.submitRestream(candidateId);
      replaceState(state);
      showToast("Restream channel submitted");
    } catch (error) {
      showToast(error.message === "restream_access_token_missing" ? "Restream token missing" : error.message);
    }
  }

  async function refreshRestreamOAuth() {
    const candidateId = profile.restreamCandidate?.id || `candidate-${profile.id}`;
    try {
      const { state } = await api.refreshRestreamOAuth(candidateId);
      replaceState(state);
      showToast("Restream OAuth tokens refreshed");
    } catch (error) {
      showToast(error.message);
    }
  }

  async function startRestreamOAuth() {
    const candidateId = profile.restreamCandidate?.id || `candidate-${profile.id}`;
    try {
      const result = await api.startRestreamOAuth(candidateId);
      window.location.href = result.authorizeUrl;
    } catch (error) {
      showToast(error.message);
    }
  }

  async function validateRestreamChannels() {
    const candidateId = profile.restreamCandidate?.id || `candidate-${profile.id}`;
    try {
      const result = await api.validateRestreamChannels(candidateId);
      replaceState(result.state);
      showToast(`${result.channels.length} Restream channel record(s) validated`);
    } catch (error) {
      showToast(error.message);
    }
  }

  return (
    <section className="social-content" aria-live="polite">
      <section className="profile-view">
        <div className="profile-header">
          <div>
            <p className="eyebrow">{brand?.name}</p>
            <h2>{getPlatform(profile.platformKey)?.name}</h2>
            <div className="meta-row">
              <span>{profile.priority}</span>
              <span>Owner: {brand?.owner}</span>
              <span>{brand?.domain}</span>
              <span>{profile.nextAction ? "Action Required" : "Ready for Review"}</span>
            </div>
          </div>
          <div className="readiness-stack">
            <div className="readiness-card"><span>{score}%</span><small>ready</small></div>
          </div>
        </div>

        <section className="state-grid" aria-label="Readiness states">
          <StateCard label="Ownership" value={profile.ownershipState} />
          <StateCard label="Security" value={profile.securityState} />
          <StateCard label="Profile" value={profile.profileState} />
          <StateCard label="Connector" value={profile.connectorState} />
        </section>

        <WorkflowGuide profile={profile} activeSection={activeSection} onFocus={focusSection} />

        {(profile.blockedReason || profile.nextAction) ? (
          <section className={`panel compact-panel guide-target ${activeSection === "blocker" ? "guide-active" : ""}`} data-guide-section="blocker">
            <div className="panel-heading tight">
              <div>
                <p className="eyebrow">Operational Blocker</p>
                <h3>{profile.blockedReason ? "Publishing Blocked" : "Next Action"}</h3>
                {profile.blockedReason ? <p className="section-description">{profile.blockedReason}</p> : null}
                {profile.nextAction ? <p className="section-description"><strong>Next:</strong> {profile.nextAction}</p> : null}
                {profile.restreamCandidate?.youtubeLiveExpectedAt ? <p className="section-description"><strong>Activation target:</strong> {formatDateTime(profile.restreamCandidate.youtubeLiveExpectedAt)}</p> : null}
              </div>
              <span className={`status-pill ${profile.blockedReason ? "needs-approval" : "approved"}`}>{profile.blockedReason ? "Blocked" : "Ready"}</span>
            </div>
          </section>
        ) : null}

        <div className="profile-grid">
          <div className="workflow-column workflow-column-profile">
            <section className={`panel profile-panel guide-target ${activeSection === "profile" ? "guide-active" : ""}`} data-guide-section="profile">
              <div className="panel-heading tight">
                <div><span className="step-pill">Step 1</span><p className="eyebrow">Platform builder</p><h3>Profile Elements</h3><p className="section-description">{guidance.profile}</p></div>
                <button className="primary-button" type="button" onClick={saveProfile} disabled={!can(governance, "edit_profile")}>Save Profile</button>
              </div>
              <div className="profile-form">
                <Field label="Target Handle" value={draft.targetHandle} onChange={(value) => updateDraft("targetHandle", value)} />
                <Field label="Actual Handle" value={draft.actualHandle} onChange={(value) => updateDraft("actualHandle", value)} />
                <Field label="Profile URL" value={draft.profileUrl} onChange={(value) => updateDraft("profileUrl", value)} />
                <Field label="Display Name" value={draft.displayName} onChange={(value) => updateDraft("displayName", value)} />
                <Field label="Bio" value={draft.bio} onChange={(value) => updateDraft("bio", value)} textarea full />
                <Field label="Website URL" value={draft.websiteUrl} onChange={(value) => updateDraft("websiteUrl", value)} />
                <label className="field"><span>Business Account Status</span><select value={draft.businessAccountStatus} onChange={(event) => updateDraft("businessAccountStatus", event.target.value)}><option value="unknown">Unknown</option><option value="not_required">Not Required</option><option value="required_missing">Required Missing</option><option value="pending">Pending</option><option value="verified">Verified</option></select></label>
                <Field label="Profile Image Asset" value={draft.profileImageAsset} onChange={(value) => updateDraft("profileImageAsset", value)} />
                <Field label="Banner Asset" value={draft.bannerAsset} onChange={(value) => updateDraft("bannerAsset", value)} />
                <Field label="Next Action" value={draft.nextAction} onChange={(value) => updateDraft("nextAction", value)} full />
                <Field label="Operator Notes" value={draft.notes} onChange={(value) => updateDraft("notes", value)} textarea full />
              </div>
            </section>
            <StatusPanels profile={profile} governance={governance} brand={brand} deployment={deployment} refreshDeploymentGate={refreshDeploymentGate} zone="profile" />
          </div>

          <aside className="side-stack workflow-column workflow-column-assets">
            <section className={`panel guide-target ${activeSection === "assets" ? "guide-active" : ""}`} data-guide-section="assets">
              <div className="panel-heading tight"><div><span className="step-pill">Step 2</span><h3>Media Asset Library</h3><p className="section-description">{guidance.media}</p></div><div className="button-row"><button className="ghost-button" type="button" onClick={scanPlatformAssets} disabled={!can(governance, "record_asset")}>Scan Platform Assets</button><button className="ghost-button" type="button" onClick={addAsset} disabled={!can(governance, "record_asset")}>Add Metadata</button></div></div>
              {profile.platformScan ? <p className="section-description">Last scan: {formatDateTime(profile.platformScan.scannedAt)} - {profile.platformScan.assetsFound} found, {profile.platformScan.assetsRecorded} recorded.</p> : null}
              <MediaAssetUploader onUpload={uploadAsset} disabled={!can(governance, "record_asset")} />
              <CardList items={profile.mediaAssets || []} empty="No media assets recorded." render={(asset) => <><AssetPreview asset={asset} /><strong>{asset.assetName}</strong><small>{formatLabel(asset.assetType)} - {asset.width && asset.height ? `${asset.width} x ${asset.height}px` : "dimensions pending"}{asset.platformStatus ? ` - ${formatLabel(asset.platformStatus)}` : ""}{asset.fileSizeBytes ? ` - ${Math.round(asset.fileSizeBytes / 1024)} KB` : ""}</small><p>{asset.description}</p>{asset.publicUrl ? <a className="asset-link" href={asset.publicUrl} target="_blank" rel="noreferrer">Open asset link</a> : null}</>} />
            </section>
            <StatusPanels profile={profile} governance={governance} brand={brand} deployment={deployment} refreshDeploymentGate={refreshDeploymentGate} zone="assets" />
          </aside>

          <div className="workflow-column workflow-column-restream">
            <div className={`restream-step guide-target ${activeSection === "restream" ? "guide-active" : ""}`} data-guide-section="restream">
              <RestreamPanel profile={profile} guidance={guidance.restream} governance={governance} saveRestream={saveRestream} storeSecret={storeSecret} approveRestream={approveRestream} dryRunRestream={dryRunRestream} startRestreamOAuth={startRestreamOAuth} refreshRestreamOAuth={refreshRestreamOAuth} validateRestreamChannels={validateRestreamChannels} submitRestream={submitRestream} />
            </div>
            <StatusPanels profile={profile} governance={governance} brand={brand} deployment={deployment} refreshDeploymentGate={refreshDeploymentGate} zone="restream" />
          </div>
        </div>
      </section>
    </section>
  );
}

function WorkflowGuide({ profile, activeSection, onFocus }) {
  const recommended = recommendedSection(profile);
  const sections = [
    ...(profile.blockedReason ? ["blocker"] : []),
    "profile",
    "assets",
    "restream"
  ];
  return (
    <section className="workflow-guide" aria-label="Workflow guidance">
      <div>
        <p className="eyebrow">Current Focus</p>
        <h3>{sectionLabel(recommended)}</h3>
        <p>{profile.blockedReason || profile.nextAction || "Complete the highlighted section, then continue to the next readiness gate."}</p>
      </div>
      <div className="guide-actions">
        {sections.map((section) => (
          <button className={`ghost-button ${activeSection === section ? "active-guide-button" : ""}`} type="button" key={section} onClick={() => onFocus(section)}>
            {sectionLabel(section)}
          </button>
        ))}
      </div>
    </section>
  );
}

function StateCard({ label, value }) {
  return <div className="state-card"><span>{label}</span><strong>{formatLabel(value)}</strong></div>;
}

function Field({ label, value, onChange, textarea = false, full = false, disabled = false }) {
  return (
    <label className={`field ${full ? "full-width" : ""}`}>
      <span>{label}</span>
      {textarea ? <textarea rows="4" value={value || ""} onChange={(event) => onChange(event.target.value)} disabled={disabled} /> : <input value={value || ""} onChange={(event) => onChange(event.target.value)} autoComplete="off" disabled={disabled} />}
    </label>
  );
}

function CardList({ items, empty, render }) {
  if (!items.length) return <p className="empty-note">{empty}</p>;
  return <div className="media-asset-list">{items.map((item) => <article className="media-asset-card phase2-card" key={item.id}>{render(item)}</article>)}</div>;
}

function AssetPreview({ asset }) {
  const url = asset.publicUrl || asset.platformAssetUrl || "";
  if (!url) return <div className="asset-preview empty">No preview</div>;
  const type = String(asset.assetType || "").toLowerCase();
  const isVideo = type.includes("video") || /\.(mp4|mov|m4v|webm)(\?|$)/i.test(url);
  const isImage = type.includes("avatar") || type.includes("banner") || type.includes("thumbnail") || type.includes("image") || type.includes("gif") || /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url);
  if (isVideo) {
    return (
      <a className="asset-preview wide" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${asset.assetName}`}>
        <video src={url} muted playsInline preload="metadata" />
      </a>
    );
  }
  if (isImage) {
    return (
      <a className={`asset-preview ${type.includes("banner") ? "wide" : "square"}`} href={url} target="_blank" rel="noreferrer" aria-label={`Open ${asset.assetName}`}>
        <img src={url} alt={asset.assetName || "Observed platform asset"} loading="lazy" referrerPolicy="no-referrer" />
      </a>
    );
  }
  return <a className="asset-preview empty" href={url} target="_blank" rel="noreferrer">Preview unavailable</a>;
}

function MediaAssetUploader({ onUpload, disabled = false }) {
  const [assetType, setAssetType] = useState("avatar");
  const [assetName, setAssetName] = useState("");
  const [usageContext, setUsageContext] = useState("");
  const [platformAssetUrl, setPlatformAssetUrl] = useState("");
  const [platformStatus, setPlatformStatus] = useState("observed_on_platform");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (disabled || (!file && !platformAssetUrl)) return;
    setBusy(true);
    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("assetType", assetType);
    formData.append("assetName", assetName || file?.name || `${formatLabel(assetType)} observed on platform`);
    formData.append("usageContext", usageContext || "Profile construct media asset");
    formData.append("platformAssetUrl", platformAssetUrl);
    formData.append("platformStatus", platformStatus);
    formData.append("description", platformAssetUrl
      ? "Asset observed on the live social account. Review against brand standards before keeping, replacing, or approving."
      : "Uploaded through Phase 4 media storage. Dimensions and file size are detected by the backend when available.");
    try {
      await onUpload(formData);
      setAssetName("");
      setUsageContext("");
      setPlatformAssetUrl("");
      setPlatformStatus("observed_on_platform");
      setFile(null);
      event.currentTarget.reset();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={submit}>
      <label className="field"><span>Asset Type</span><select value={assetType} onChange={(event) => setAssetType(event.target.value)} disabled={disabled}><option value="avatar">Profile Image</option><option value="banner">Header / Banner</option><option value="thumbnail">Thumbnail / Cover</option><option value="video">Video</option><option value="screenshot">Screenshot</option><option value="document">Other File</option></select></label>
      <label className="field"><span>Asset Name</span><input value={assetName} onChange={(event) => setAssetName(event.target.value)} placeholder="Optional display name" disabled={disabled} /></label>
      <label className="field full-width"><span>Usage Context</span><input value={usageContext} onChange={(event) => setUsageContext(event.target.value)} placeholder="Where this asset belongs in the profile construct" disabled={disabled} /></label>
      <label className="field full-width"><span>Existing Platform Asset URL</span><input value={platformAssetUrl} onChange={(event) => setPlatformAssetUrl(event.target.value)} placeholder="Paste current platform image, GIF, video, or screenshot URL" disabled={disabled} /></label>
      <label className="field"><span>Platform Asset Status</span><select value={platformStatus} onChange={(event) => setPlatformStatus(event.target.value)} disabled={disabled}><option value="observed_on_platform">Observed On Platform</option><option value="keep_current">Keep Current</option><option value="replace_recommended">Replace Recommended</option><option value="approved_current">Approved Current</option></select></label>
      <label className="field full-width"><span>Upload File</span><input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} accept="image/*,video/*,.pdf,.txt,.md,.csv" disabled={disabled} /></label>
      <button className="primary-button full-width" type="submit" disabled={disabled || (!file && !platformAssetUrl) || busy}>{busy ? "Recording..." : "Record Asset"}</button>
    </form>
  );
}

function RestreamPanel({ profile, guidance, governance, saveRestream, storeSecret, approveRestream, dryRunRestream, startRestreamOAuth, refreshRestreamOAuth, validateRestreamChannels, submitRestream }) {
  const [draft, setDraft] = useState(profile.restreamCandidate || {});
  useEffect(() => setDraft(profile.restreamCandidate || {}), [profile]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const connectedChannels = draft.restreamConnectedChannels || [];
  const matchedChannels = draft.restreamMatchedChannels || [];
  const channelValidation = draft.restreamChannelValidation || {};
  const canEditCandidate = can(governance, "edit_profile") || can(governance, "approve_connector");
  const canStoreSecret = can(governance, "store_secret");
  const canApprove = can(governance, "approve_connector");
  const canSubmit = can(governance, "submit_connector");
  return (
    <article className="panel">
      <div className="panel-heading tight">
        <div><span className="step-pill">Step 3</span><p className="eyebrow">Restream channel candidate</p><h3>Manual Configuration</h3><p className="section-description">{guidance}</p></div>
        <span className="status-pill needs-approval">{formatLabel(draft.approvalState || "draft")}</span>
      </div>
      <div className="restream-form">
        <label className="field"><span>Restream Platform</span><select value={draft.platformId || ""} onChange={(event) => update("platformId", event.target.value)} disabled={!canEditCandidate}>{restreamPlatforms.map((platform) => <option key={platform.id || "none"} value={platform.id}>{platform.name}</option>)}</select></label>
        <Field label="Restream Display Name" value={draft.displayName} onChange={(value) => update("displayName", value)} disabled={!canEditCandidate} />
        <Field label="Stream URL Secret Ref" value={draft.streamUrlSecretRef} onChange={(value) => update("streamUrlSecretRef", value)} disabled={!canEditCandidate} />
        <Field label="Stream Key Secret Ref" value={draft.streamKeySecretRef} onChange={(value) => update("streamKeySecretRef", value)} disabled={!canEditCandidate} />
        <Field label="RTMP Username Secret Ref" value={draft.rtmpUsernameSecretRef} onChange={(value) => update("rtmpUsernameSecretRef", value)} disabled={!canEditCandidate} />
        <Field label="RTMP Password Secret Ref" value={draft.rtmpPasswordSecretRef} onChange={(value) => update("rtmpPasswordSecretRef", value)} disabled={!canEditCandidate} />
      </div>
      <SecretCapture onStore={storeSecret} candidate={draft} disabled={!canStoreSecret} />
      <section className="connector-summary">
        <div className="panel-heading tight">
          <div>
            <h4>Connected Destination Check</h4>
            <p className="section-description">Read-only validation against Restream. This records sanitized channel metadata only; it does not create or modify a Restream channel.</p>
          </div>
          <span className={`status-pill ${matchedChannels.length ? "approved" : "needs-approval"}`}>{matchedChannels.length}/{connectedChannels.length} matched</span>
        </div>
        {channelValidation.validatedAt ? <small>Last checked: {new Date(channelValidation.validatedAt).toLocaleString()} - {formatLabel(channelValidation.status)}</small> : <small>No Restream channel validation yet.</small>}
        {draft.youtubeLiveActivationStatus ? <small>YouTube live activation: {formatLabel(draft.youtubeLiveActivationStatus)}{draft.youtubeLiveExpectedAt ? ` until ${formatDateTime(draft.youtubeLiveExpectedAt)}` : ""}</small> : null}
        <div className="required-list">
          {connectedChannels.slice(0, 4).map((channel, index) => (
            <div className={`required-item ${matchedChannels.some((match) => (match.id || match.channelId) === (channel.id || channel.channelId)) ? "done" : "missing"}`} key={channel.id || channel.channelId || index}>
              <strong>{channel.displayName || channel.name || `Restream Channel ${index + 1}`}</strong>
              <span className="status-pill needs-approval">{channel.platformName || channel.platform || channel.platformId || "Connected"}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="button-row">
        <button className="ghost-button" type="button" onClick={() => saveRestream(draft)} disabled={!canEditCandidate}>Save Candidate</button>
        <button className="ghost-button" type="button" onClick={dryRunRestream}>Dry Run</button>
        <button className="ghost-button" type="button" onClick={startRestreamOAuth} disabled={!canStoreSecret}>Start OAuth Grant</button>
        <button className="ghost-button" type="button" onClick={refreshRestreamOAuth} disabled={!canStoreSecret}>Refresh OAuth Token</button>
        <button className="ghost-button" type="button" onClick={validateRestreamChannels} disabled={!canApprove}>Validate Channels</button>
        <button className="primary-button" type="button" onClick={approveRestream} disabled={!canApprove}>Approve Candidate</button>
        <button className="primary-button" type="button" onClick={submitRestream} disabled={!canSubmit}>Submit to Restream</button>
      </div>
    </article>
  );
}

function SecretCapture({ onStore, candidate, disabled = false }) {
  const [credentialType, setCredentialType] = useState("streamKey");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const refFields = {
    streamUrl: candidate.streamUrlSecretRef,
    streamKey: candidate.streamKeySecretRef,
    rtmpUsername: candidate.rtmpUsernameSecretRef,
    rtmpPassword: candidate.rtmpPasswordSecretRef,
    restreamAccessToken: candidate.restreamAccessTokenSecretRef,
    restreamClientId: candidate.restreamClientIdSecretRef,
    restreamClientSecret: candidate.restreamClientSecretRef,
    restreamRefreshToken: candidate.restreamRefreshTokenSecretRef
  };

  async function submit(event) {
    event.preventDefault();
    if (disabled || !value) return;
    setBusy(true);
    try {
      await onStore(credentialType, value);
      setValue("");
      event.currentTarget.reset();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="secret-form" onSubmit={submit}>
      <div>
        <h4>Credential Vault</h4>
        <p>Enter streaming credentials once. The backend stores the secret and returns only a reference for this profile.</p>
      </div>
      <label className="field"><span>Credential Type</span><select value={credentialType} onChange={(event) => setCredentialType(event.target.value)} disabled={disabled}><option value="streamUrl">Stream URL</option><option value="streamKey">Stream Key</option><option value="rtmpUsername">RTMP Username</option><option value="rtmpPassword">RTMP Password</option><option value="restreamAccessToken">Restream Access Token</option><option value="restreamClientId">Restream Client ID</option><option value="restreamClientSecret">Restream Client Secret</option><option value="restreamRefreshToken">Restream Refresh Token</option></select></label>
      <label className="field"><span>Secret Value</span><input type="password" value={value} onChange={(event) => setValue(event.target.value)} autoComplete="off" disabled={disabled} /></label>
      <button className="primary-button" type="submit" disabled={disabled || !value || busy}>{busy ? "Storing..." : "Store Secret Ref"}</button>
      <div className="secret-ref-list">
        {Object.entries(refFields).map(([key, ref]) => <span key={key} className={`status-pill ${ref ? "approved" : "needs-approval"}`}>{formatLabel(key)}: {ref ? "Stored" : "Missing"}</span>)}
      </div>
    </form>
  );
}

function StatusPanels({ profile, governance, brand, deployment, refreshDeploymentGate, zone }) {
  const required = getPlatform(profile.platformKey)?.required || [];
  const readiness = profile.readiness || {};
  const gates = readiness.gates || {};
  const activeRole = governance?.roles?.[governance?.activeRole];
  const brandPolicy = governance?.brandPolicies?.[brand?.slug];
  return (
    <>
      {zone === "profile" ? <section className="panel governance-panel step-status step-status-profile">
        <div className="panel-heading tight">
          <div>
            <p className="eyebrow">Governance</p>
            <h3>{activeRole?.label || "No active role"}</h3>
            <p className="section-description">{brandPolicy?.boundary || "Use the selected role to keep brand work scoped and auditable."}</p>
          </div>
          <span className="status-pill approved">Phase 8</span>
        </div>
        <div className="governance-list">
          {(activeRole?.permissions || []).filter((permission) => permission !== "record_evidence").map((permission) => <span className="status-pill approved" key={permission}>{formatLabel(permission)}</span>)}
        </div>
        <div className="approval-rules">
          {(governance?.approvalRules || []).map((rule) => <p key={rule}>{rule}</p>)}
        </div>
      </section> : null}
      {zone === "profile" ? <DeploymentGatePanel deployment={deployment} onRefresh={refreshDeploymentGate} className="step-status step-status-profile" /> : null}
      {zone === "assets" ? <section className="panel step-status step-status-assets">
        <div className="panel-heading tight"><h3>Required Fields</h3><span className="status-pill needs-approval">{required.filter((field) => isComplete(profile, field)).length}/{required.length}</span></div>
        <div className="required-list">{required.map((field) => <div className={`required-item ${isComplete(profile, field) ? "done" : "missing"}`} key={field}><strong>{formatLabel(field)}</strong><span className={`status-pill ${isComplete(profile, field) ? "approved" : "needs-approval"}`}>{isComplete(profile, field) ? "Done" : "Missing"}</span></div>)}</div>
      </section> : null}
      {zone === "restream" ? <section className="panel step-status step-status-restream">
        <div className="panel-heading tight"><h3>Backend Gates</h3><span className={`status-pill ${readiness.readyForConnector ? "approved" : "needs-approval"}`}>{readiness.readyForConnector ? "Connector Ready" : "Blocked"}</span></div>
        <div className="required-list">
          {Object.entries(gates).map(([gate, passed]) => (
            <div className={`required-item ${passed ? "done" : "missing"}`} key={gate}>
              <strong>{formatLabel(gate)}</strong>
              <span className={`status-pill ${passed ? "approved" : "needs-approval"}`}>{passed ? "Passed" : "Needed"}</span>
            </div>
          ))}
        </div>
      </section> : null}
      {zone === "restream" ? <section className="panel step-status step-status-restream">
        <div className="panel-heading tight"><h3>Payload Preview</h3></div>
        <pre className="payload-preview">{JSON.stringify(buildRestreamPayload(profile), null, 2)}</pre>
      </section> : null}
    </>
  );
}

function DeploymentGatePanel({ deployment, onRefresh = () => {}, className = "" }) {
  const [openItems, setOpenItems] = useState({});
  const [reviewedItems, setReviewedItems] = useState({});
  const checks = deployment?.checks || [];
  const blockers = deployment?.blockers?.length || 0;
  const warnings = deployment?.warnings?.length || 0;
  const architecture = deployment?.recommendedArchitecture;
  const activeChecks = checks.filter((item) => item.status !== "pass");
  const passedChecks = checks.filter((item) => item.status === "pass");
  function toggleItem(id) {
    setOpenItems((current) => ({ ...current, [id]: !current[id] }));
  }
  function markReviewed(id) {
    setReviewedItems((current) => ({ ...current, [id]: true }));
  }
  return (
    <section className={`panel deployment-panel ${className}`}>
      <div className="panel-heading tight">
        <div>
          <p className="eyebrow">Phase 9A</p>
          <h3>Deployment Blindspot Gate</h3>
          <p className="section-description">Deployment is blocked until production risks are visible, classified, and intentionally cleared.</p>
        </div>
        <span className={`status-pill ${deployment?.readyForHostedProduction ? "approved" : "needs-approval"}`}>
          {deployment?.readyForHostedProduction ? "Clear" : `${blockers} blockers`}
        </span>
      </div>
      <div className="deployment-summary">
        <span className="status-pill needs-approval">{blockers} Blockers</span>
        <span className="status-pill warning-pill">{warnings} Warnings</span>
        <span className="status-pill approved">{passedChecks.length} Pass</span>
      </div>
      <div className="deployment-actions">
        <button className="ghost-button" type="button" onClick={onRefresh}>Re-check Gate</button>
      </div>
      {architecture ? (
        <div className="architecture-card">
          <strong>Phase 9B Target</strong>
          <p>{architecture.posture}: {architecture.hosting}</p>
          <p>Database: {architecture.primaryDatabase}</p>
          {architecture.dataModel ? <p>Schema: {architecture.dataModel}</p> : null}
          {architecture.persistenceAdapter ? <p>Adapter: {architecture.persistenceAdapter}</p> : null}
          <p>Assets: {architecture.assetStorage}</p>
          <p>Secrets: {architecture.secretStore}</p>
          <p>Rule: {architecture.deploymentRule}</p>
        </div>
      ) : null}
      <div className="deployment-checks">
        {activeChecks.length ? activeChecks.map((item) => (
          <DeploymentResolverItem
            item={item}
            key={item.id}
            open={openItems[item.id] ?? item.status === "blocker"}
            reviewed={reviewedItems[item.id]}
            onToggle={() => toggleItem(item.id)}
            onMarkReviewed={() => markReviewed(item.id)}
            onRefresh={onRefresh}
          />
        )) : <p className="empty-note">Deployment status is loading.</p>}
      </div>
      {passedChecks.length ? (
        <details className="passed-checks">
          <summary>{passedChecks.length} passed checks</summary>
          <div className="deployment-checks compact-checks">
            {passedChecks.map((item) => (
              <article className={`deployment-check ${item.status}`} key={item.id}>
                <strong>{item.label}</strong>
                <span>{formatLabel(item.status)}</span>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function DeploymentResolverItem({ item, open, reviewed, onToggle, onMarkReviewed, onRefresh }) {
  const remediation = item.remediation || {};
  const fixSteps = remediation.fixSteps || [];
  const envVars = remediation.environmentVars || [];
  return (
    <article className={`deployment-check resolver-check ${item.status} ${open ? "open" : ""}`}>
      <button className="resolver-toggle" type="button" onClick={onToggle}>
        <span>
          <strong>{item.label}</strong>
          <small>{item.detail}</small>
        </span>
        <span className={`status-pill ${item.status === "warning" ? "warning-pill" : "needs-approval"}`}>{formatLabel(item.status)}</span>
      </button>
      {open ? (
        <div className="resolver-body">
          <div className="resolver-meta">
            <span className="status-pill approved">Owner: {remediation.owner || "Review"}</span>
            <span className="status-pill draft">Mode: {formatLabel(remediation.actionMode || "review_required")}</span>
            {reviewed ? <span className="status-pill approved">Human step marked done</span> : null}
          </div>
          <p>{remediation.why || "Review this blocker before deployment."}</p>
          <div className="resolver-columns">
            <div>
              <h4>Fix Steps</h4>
              <ol>
                {fixSteps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>
            <div>
              <h4>Action Path</h4>
              <p><strong>Codex:</strong> {remediation.codexAction || "Review and propose the next patch."}</p>
              <p><strong>Operator:</strong> {remediation.humanAction || "Approve external account changes."}</p>
              {envVars.length ? (
                <>
                  <h4>Required Config</h4>
                  <div className="env-chip-list">
                    {envVars.map((name) => <code key={name}>{name}</code>)}
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <div className="resolver-actions">
            <button className="ghost-button" type="button" onClick={onMarkReviewed}>Mark Human Step Done</button>
            <button className="primary-button" type="button" onClick={onRefresh}>Re-check Gate</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
