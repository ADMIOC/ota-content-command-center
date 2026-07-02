# OTA Social Engine Remaining Build Steps

## Current Status

The OTA Social Engine is currently a Phase 6 app/backend shell and structured control-plane prototype. It has a local React frontend, trusted backend API boundary, file-backed working state, local media upload storage, encrypted local secret storage, seeded Notion databases, platform-specific readiness logic, evidence capture, media asset metadata, audit routes, Notion-sync status, Restream dry-run previews, and gated Restream channel submission.

It is not yet the official working platform because Notion is not yet wired as the live source of truth, media files are not stored through a real asset pipeline, secrets are not stored in a secure vault, and Restream writes are not handled through an approved submission service.

## Target Definition

The official working platform should let the OTA operator build, verify, approve, and connect brand social profiles from one governed command center.

| Layer | Target Role |
| --- | --- |
| Notion | Structured control plane and human review surface |
| Frontend | Operator interface for brand/platform profile buildout |
| Backend | Trusted service for Notion sync, media handling, secret handling, and Restream API writes |
| Asset storage | Durable media store for profile images, banners, screenshots, videos, and proof files |
| Secret storage | Secure storage for Restream stream URLs, stream keys, RTMP auth, API tokens, and OAuth material |
| Audit log | Durable event trail for profile changes, evidence, approvals, connector actions, and failures |

## Build Principle

This is a human-led account readiness system, not an account factory. The platform should support claiming, verification, profile assembly, evidence, media readiness, connector approval, and Restream channel configuration. It should not automate bulk signups, bypass verification, store plaintext secrets, or publish/live-stream without human approval.

## Phase 1: Stabilize The Control Plane

Status: Completed on 2026-06-30.

### Goal

Make Notion the clean operating source for the first real build cycle.

### Steps

1. Lock the canonical database set:
   - Social Brands
   - Social Profiles by Brand
   - Social Media Assets
   - Internal records retained for optional audit/history, not an account-build step
   - Restream Channel Candidates
   - Audit Events

2. Add missing production fields:
   - `external_id`
   - `source_system`
   - `last_synced_at`
   - `sync_status`
   - `blocked_reason`
   - `next_action`
   - `approved_by`
   - `approved_at`
   - `ready_for_connector`
   - `ready_for_publishing`

3. Add relation fields where Notion supports the intended workflow:
   - Brand to Profiles
   - Profile to Media Assets
   - Profile to Evidence
   - Profile to Restream Candidates
   - Profile to Audit Events

4. Create operating views:
   - P0 Working Table
   - Readiness Board
   - Blocked Profiles
   - Assets Needing Review
   - Evidence Queue
   - Restream Approval Queue
   - Brand Launch Dashboard

5. Define status meanings in Notion:
   - Ownership Claimed means account access is proven.
   - Security Verified means MFA/recovery/credential custody is proven.
   - Profile Ready means required public profile fields and approved assets are complete.
   - Connector Candidate means connector work can begin.
   - Connected means the external destination was created or verified.

### Exit Criteria

Notion can represent every required state for the first four brands without relying on local-only fields or chat memory.

### Completion Notes

Phase 1 is complete. The Notion control plane now includes:

| Completed Item | Result |
| --- | --- |
| Canonical database set | Six databases are present: Social Brands, Social Profiles by Brand, Social Media Assets, internal records/history, Restream Channel Candidates, and Social Audit Events. |
| Production fields | Sync, approval, blocked-reason, next-action, and readiness fields were added across the operating databases. |
| Relations | Brand/profile and profile-to-asset/evidence/restream/audit relation fields were added where Notion supports the workflow. |
| Operating views | Phase 1 views were created for brand status, P0 profile work, readiness, blockers, asset review, evidence review, Restream approval, brand launch, and audit events. |
| Status definitions | Ownership, security, profile, connector, and connected-state meanings were posted to the Notion hub. |
| Audit record | A system audit event was created for Phase 1 completion. |

Phase 1 does not make the platform production-live. It makes Notion ready to act as the structured control plane for Phase 2 app/backend work.

## Phase 2: Convert Static HTML Into A Real App

Status: Completed on 2026-06-30.

### Goal

Replace the local static prototype with a maintainable app that reads and writes real data.

### Steps

1. Choose app stack:
   - Recommended: Next.js or equivalent lightweight React app.
   - Keep the current HTML as the visual prototype and migrate its behavior into components.

2. Build core routes:
   - `/brands`
   - `/brands/[brandSlug]`
   - `/brands/[brandSlug]/profiles/[platform]`
   - `/assets`
   - `/evidence`
   - `/restream-candidates`
   - `/audit`

3. Build app components:
   - Brand selector
   - Platform profile card
   - Three-column profile workspace
   - Step 1 Profile Elements
   - Step 2 Media Asset Library
   - Internal records are retained in the backend but removed as an operator-facing account-build step.
   - Restream Manual Configuration
   - Required fields panel
   - Payload preview panel
   - Audit timeline

4. Preserve the current UX rules:
   - Three-column layout on desktop.
   - Responsive two-column and one-column fallbacks only when viewport requires it.
   - Step labels only on manual-input sections.
   - Platform-specific guidance for every platform.
   - Required-field tracking below the manual input band.

5. Add app configuration:
   - `NOTION_TOKEN`
   - Notion data source IDs
   - Restream client/API credentials
   - Asset storage bucket configuration
   - Secret storage configuration

### Exit Criteria

The app renders the same workflow as the HTML prototype but loads data from an API instead of browser local storage.

### Completion Notes

Phase 2 is complete. The static Social Profile by Brand prototype was preserved and a real local app shell was added.

| Completed Item | Result |
| --- | --- |
| App stack | Added Vite, React, Express, and a single dev command through `npm run dev`. |
| Backend API boundary | Added `server/index.mjs` with health, state, profile update, media asset, evidence, Restream candidate, approval, and reset endpoints. |
| File-backed working state | Added local JSON persistence at `data/social-engine-state.json`, ignored by git so operator test data does not become source control noise. |
| App shell | Added `app.html`, `src/main.jsx`, `src/socialEngineData.js`, and `src/phase2.css`. |
| Four-brand seed set | Seeded Own The Algo Podcast, CRS Healthcare Solutions, WYR Detail, and The VFO. |
| Platform coverage | Seeded YouTube, Instagram, Facebook Page, LinkedIn, TikTok, and Custom RTMP guidance and required-field rules. |
| OTAP YouTube profile | Seeded the confirmed `@ownthealgo` YouTube handle, `Agentic Jey` display name, YouTube URL, starter bio, media candidates, and evidence rows. |
| Workflow structure | Preserved Step 1 Profile Elements, Step 2 Media Asset Library, and Restream Manual Configuration while removing Evidence Vault as an operator-facing account-build step. |
| Human approval gate | Restream candidate approval can be recorded locally, but submit remains blocked until the secured Restream phase. |
| Verification | `npm run build` passed, `GET /api/health` returned ok, and `GET /api/state` returned the seeded app state. |

Phase 2 intentionally does not perform live Notion writes, upload media files, store plaintext stream keys, or submit Restream channels. Those are Phase 3 through Phase 6 responsibilities.

## Phase 3: Build The Backend API

Status: Completed on 2026-06-30.

### Goal

Create a trusted service boundary between the browser, Notion, media storage, secrets, and Restream.

### Required API Routes

| Route | Purpose |
| --- | --- |
| `GET /api/brands` | List brands |
| `GET /api/brands/:slug` | Get brand with profile summary |
| `GET /api/profiles/:id` | Get full social profile |
| `PATCH /api/profiles/:id` | Update public profile fields |
| `POST /api/profiles/:id/assets` | Add media asset metadata and upload reference |
| `POST /api/profiles/:id/evidence` | Add non-secret evidence |
| `POST /api/profiles/:id/audit-events` | Record audit event |
| `GET /api/restream/candidates` | List Restream candidates |
| `PATCH /api/restream/candidates/:id` | Update candidate fields |
| `POST /api/restream/candidates/:id/approve` | Record human approval |
| `POST /api/restream/candidates/:id/submit` | Submit approved candidate to Restream |

### Backend Rules

1. Browser never receives plaintext stream keys after initial submission.
2. Browser never stores Restream API tokens.
3. Backend writes secrets to the secret store and writes only references to Notion.
4. Backend computes readiness from Notion state plus local validation rules.
5. Backend blocks Restream writes unless approval and readiness gates pass.
6. Backend records every state-changing action in audit events.

### Exit Criteria

The frontend can complete profile updates, asset metadata, evidence, approvals, and Restream candidate updates through the backend.

### Completion Notes

Phase 3 is complete as a trusted local backend boundary. The browser can no longer be treated as the owner of readiness, audit, or Restream candidate rules.

| Completed Item | Result |
| --- | --- |
| Resource API routes | Added brand, profile, asset, evidence, audit, Restream candidate, and Notion status routes. |
| Server-side readiness | Added backend readiness scoring, required-field checks, connector gates, and publishing gates. |
| Secret protection | Backend rejects plaintext stream URL, stream key, RTMP username, RTMP password, and Restream token fields. |
| Sanitized responses | Restream candidates return secret-reference booleans and secret refs only; plaintext credential fields are not returned. |
| Audit boundary | State-changing routes write audit events through the backend. |
| Restream submit gate | Submit route exists but blocks external Restream writes until the Phase 6 submit adapter is enabled. |
| Notion status boundary | Added Notion data-source configuration status and sync-plan endpoints without exposing `NOTION_TOKEN`. |
| Platform guidance | Added platform-specific guidance for Facebook Page, LinkedIn, and TikTok so they no longer fall back to YouTube copy. |
| Frontend alignment | UI now labels the app as Phase 3 and shows backend readiness gates. |

Phase 3 does not yet perform live Notion writes, upload media files, store secrets in a vault, or submit Restream channels. Those remain Phase 4, Phase 5, and Phase 6 responsibilities.

## Phase 4: Media Asset Storage

Status: Completed on 2026-06-30.

### Goal

Move from metadata-only assets to real managed media files.

### Steps

1. Choose the asset store:
   - Google Drive for operator-friendly storage, or
   - Cloud object storage for application-grade storage.

2. Define folder or bucket structure:
   - `brand-slug/platform/profile/`
   - `brand-slug/platform/banner/`
   - `brand-slug/platform/screenshots/`
   - `brand-slug/platform/video/`
   - `brand-slug/platform/evidence/`

3. Build upload flow:
   - Upload file.
   - Detect MIME type.
   - Detect dimensions.
   - Detect video duration where relevant.
   - Generate preview.
   - Store durable file URL or file ID.
   - Create Notion asset row.

4. Add validation:
   - YouTube profile picture minimum.
   - YouTube banner minimum and safe-area review.
   - Instagram avatar and post media requirements.
   - LinkedIn logo and banner requirements.
   - TikTok profile image and video cover requirements.
   - Platform-specific size notes in asset description.

5. Add asset approval:
   - Needs Review
   - Approved
   - Rejected
   - Superseded

### Exit Criteria

Every profile image, banner, screenshot, and proof file has a durable file reference, dimensions, usage context, approval state, and audit trail.

### Completion Notes

Phase 4 is complete as a local managed media-storage layer. The app can now upload profile media and evidence/proof files through the backend instead of recording metadata only.

| Completed Item | Result |
| --- | --- |
| Local asset store | Added local filesystem storage under `data/media-assets/`, ignored by git. |
| Public media serving | Added `/media-assets/...` static serving for locally stored files. |
| Upload API | Added `POST /api/profiles/:profileId/assets/upload` for profile image, banner, screenshot, video, thumbnail, and other files. |
| Evidence upload API | Added `POST /api/profiles/:profileId/evidence/upload` for proof files. |
| Metadata extraction | Captures original filename, stored filename, MIME type, file size, public URL, storage path, and image dimensions where readable. |
| Video placeholder | Records video files and marks duration detection as pending until a video metadata adapter is added. |
| Frontend controls | Media upload remains in Step 2. Evidence upload is retained only as backend/internal record capability, not an operator-facing account-build step. |
| Profile linkage | Avatar uploads update `profileImageAsset`; banner uploads update `bannerAsset`. |
| Audit trail | Upload routes write media/evidence audit events through the backend. |
| Verification | Build passed; asset upload, dimension detection, public URL serving, evidence upload, and health checks passed. |

Phase 4 uses local filesystem storage so the workflow can operate immediately. A Google Drive or cloud object-storage adapter can replace the storage backend later without changing the operator workflow.

## Phase 5: Secret Management

Status: Completed on 2026-06-30.

### Goal

Ensure Restream and streaming credentials are never stored in Notion or browser local storage.

### Steps

1. Choose secret store:
   - 1Password, Doppler, cloud secret manager, or equivalent.

2. Define secret reference format:
   - `secret://ota-social-engine/{brand}/{platform}/{credential}`

3. Add backend secret write flow:
   - Operator enters stream URL/key once.
   - Backend stores secret.
   - Backend returns secret reference.
   - Frontend and Notion store only the reference.

4. Add secret rotation workflow:
   - Mark secret stale.
   - Replace secret.
   - Re-test connector.
   - Record audit event.

5. Add access rules:
   - Only approved operators can create or replace secrets.
   - No secrets in screenshots.
   - No secrets in Notion.
   - No secrets in Slack.
   - No secrets in GitHub.

### Exit Criteria

Restream candidates can reference credentials without exposing credential values to Notion, Git, browser storage, or chat.

### Completion Notes

Phase 5 is complete as a local encrypted secret-reference flow. Operators can enter streaming credentials once in Step 4, and the backend stores encrypted values while returning only `secret://...` references to the app state.

| Completed Item | Result |
| --- | --- |
| Local secret store | Added encrypted local storage under `data/secrets/`, ignored by git. |
| Local key file | Added `data/secret-store.key`, ignored by git, with optional `OTA_SECRET_STORE_KEY` environment override. |
| Secret reference format | Implemented `secret://ota-social-engine/{brand}/{platform}/{credential}`. |
| Secret write route | Added `POST /api/profiles/:profileId/secrets`. |
| Secret rotation route | Added `POST /api/profiles/:profileId/secrets/:credentialType/rotate`. |
| Secret status route | Added `GET /api/secrets/status`. |
| Candidate linkage | Stored refs are attached to Restream candidate fields such as `streamKeySecretRef`. |
| Frontend capture | Added Step 4 Credential Vault with password inputs that clear after backend storage. |
| Guardrails | General profile/candidate routes still reject plaintext credential fields. |
| Audit trail | Secret storage and rotation write audit events without exposing values. |

Phase 5 uses a local encrypted store for development and operator validation. A production adapter such as 1Password, Doppler, or a cloud secret manager can replace the local store later without changing the app workflow.

## Phase 6: Restream Integration

Status: Completed on 2026-06-30.

### Goal

Wire approved Restream channel creation through the backend.

### Steps

1. Confirm OAuth/app setup:
   - Restream app credentials.
   - Access token flow.
   - `channels.write` scope enabled only when ready for channel management.

2. Build Restream candidate validator:
   - Platform ID required.
   - Display name required except where ignored.
   - Required secret refs present.
   - Approval state is Approved.
   - Profile readiness gates pass.

3. Build platform-specific payload mapping:
   - Custom RTMP: platform ID `29`, stream URL, optional stream key, optional RTMP auth.
   - Instagram: platform ID `73`, stream key, optional Instagram username.
   - Telegram: platform ID `72`, stream URL, stream key.
   - Substack: platform ID `79`, stream key.
   - Other documented manual platforms as needed.

4. Submit to Restream:
   - Resolve secret refs server-side.
   - Build payload.
   - Call `POST https://api.restream.io/v2/user/channels`.
   - Store Restream channel ID.
   - Store sanitized response.
   - Store failure code/message when rejected.

5. Add safety controls:
   - Dry-run preview.
   - Human approval gate.
   - One-submit lock.
   - Failure retry flow.
   - Connected-state verification.

### Exit Criteria

An approved candidate can be submitted to Restream from the platform, and the resulting channel ID or sanitized failure is written back to Notion and the audit log.

### Completion Notes

Phase 6 is complete as a gated Restream submit adapter. The platform can now generate sanitized dry-run payloads, validate approved candidates, resolve secret refs server-side, and call Restream only when `RESTREAM_ACCESS_TOKEN` is configured.

| Completed Item | Result |
| --- | --- |
| Restream adapter | Added `server/restreamAdapter.mjs`. |
| Integration status | `GET /api/health` reports Restream token readiness and required `channels.write` scope. |
| Dry-run route | Added `POST /api/restream/candidates/:candidateId/dry-run`. |
| Submit route | Upgraded `POST /api/restream/candidates/:candidateId/submit` from blocked placeholder to guarded submit adapter. |
| Payload mapping | Added platform-specific mapping for Custom RTMP, Telegram, Instagram, and Substack. |
| Secret resolution | Submit resolves `secret://...` refs inside the backend only. |
| OAuth refresh | Added backend refresh-token exchange using Restream client ID, client secret, and refresh token refs. |
| Safety gates | Submit requires human approval, backend readiness, valid platform payload, required secret refs, and Restream token configuration. |
| Sanitized responses | Restream responses are sanitized before being stored or returned. |
| Frontend controls | Added Step 4 Dry Run and Submit to Restream actions. |
| Audit trail | Dry runs and submissions write audit events. |

Phase 6 does not expose OAuth material to the browser. If no access token or refresh-token credential refs are available, submit returns `restream_access_token_missing` and no external Restream write occurs.

## Phase 7: First Four Brand Buildout

### Goal

Populate the command center for the first four brands with real sourced profile content, assets, evidence, and next actions.

### Brands

| Brand | Slug | Priority |
| --- | --- | --- |
| Own The Algo Podcast | `otap` | First proving ground |
| CRS Healthcare Solutions | `crshcs` | Stricter governance and no-PHI boundary |
| WYR Detail | `wyr` | Local/service brand profile buildout |
| The VFO | `thevfo` | Professional authority buildout |

### Per-Brand Steps

1. Source brand context:
   - Notion pages
   - Local docs
   - Existing websites
   - Brand kits
   - Logo/image folders
   - Prior strategy and positioning docs

2. Complete platform profiles:
   - YouTube
   - Instagram
   - Facebook Page
   - LinkedIn
   - TikTok
   - Custom RTMP where relevant

3. For each platform, complete:
   - Target handle
   - Actual handle
   - Profile URL
   - Display name
   - Bio/about copy
   - Website URL
   - Business/professional status
   - Profile image asset
   - Banner/header asset
   - Operator notes

4. Add media assets:
   - Avatar/logo
   - Banner/header
   - Screenshots
   - Video intro or trailer where relevant
   - Pinned media or launch creative

5. Add evidence:
   - Ownership proof
   - Security proof
   - Profile copy source
   - Asset source
   - Approval proof
   - Connector proof

6. Set readiness:
   - Ownership State
   - Security State
   - Profile State
   - Connector State
   - Publishing State

### Exit Criteria

Each of the first four brands has a complete readiness map with clear blockers, next actions, asset candidates, evidence records, and approval status.

### Active Implementation Notes

Phase 7 is now active as connector activation plus first-four brand buildout. OTAP YouTube is the proof profile.

| Phase 7 Item | Current State |
| --- | --- |
| Restream OAuth | Connected with client ID, client secret, access token, and refresh token stored as secret refs. |
| Connected-channel validation | Implemented as read-only Restream channel validation through the local backend. |
| YouTube destination match | Restream returns the `Agentic Jey` YouTube destination and the app records it as a profile match. |
| Non-matching destination handling | The LinkedIn destination remains visible as a connected Restream channel but does not satisfy the YouTube profile gate. |
| Platform activation blocker | YouTube phone verification is complete, but live streaming is in the mandatory activation waiting period. |
| Expected activation | July 1, 2026 at approximately 5:06 PM Pacific. |
| Current next action | Re-check YouTube Live Dashboard after the waiting period, then run Step 4 `Validate Channels` again. |

Supporting artifact: `ops/social-profile/ota-social-engine-phase-7-connector-activation-brand-buildout.md`.

## Phase 8: Governance And Permissions

### Goal

Make the platform safe for multi-brand operations.

### Steps

1. Define roles:
   - Super Admin
   - Brand Owner
   - Operator
   - Asset Reviewer
   - Connector Approver
   - Read-Only Reviewer

2. Define permissions:
   - Who can edit brand fields.
   - Who can approve assets.
   - Who can accept security evidence.
   - Who can approve Restream candidates.
   - Who can submit to Restream.

3. Add brand boundaries:
   - CRS stricter access.
   - No PHI or patient data.
   - No cross-brand leakage.
   - Scoped Notion teamspaces or permission groups where possible.

4. Add approval rules:
   - Profile Ready requires internal account confirmation, accepted profile review, approved required assets, and owner approval.
   - Security Verified requires MFA/recovery proof.
   - Restream submission requires connector approval and secret refs.
   - Publishing Ready requires final human approval.

### Exit Criteria

The platform can support more than one operator without relying on informal trust or chat-based approval.

### Active Implementation Notes

Phase 8 is now active in the local app/backend shell.

| Phase 8 Item | Current State |
| --- | --- |
| Role model | Added Super Admin, Brand Owner, Operator, Asset Reviewer, Connector Approver, and Read-Only Reviewer. |
| Active role selector | Added to the top bar so the operator can see and test the current permission context. |
| Permission-gated UI | Profile save, asset controls, evidence controls, credential vault, OAuth actions, channel validation, connector approval, and submit controls are role-gated. |
| Server-side enforcement | Local backend now rejects unauthorized profile edits, asset records, evidence records, secret writes, OAuth actions, channel validation, and connector approval. |
| Brand boundaries | Added visible brand policy boundaries, including CRS no-PHI/no-patient-data handling. |
| Approval rules | Added visible approval rules in the status column. |
| Verification | `npm run build`, `node --check server/local.mjs`, `/api/health`, role switch, and read-only denied-write checks passed. |

Supporting artifact: `ops/social-profile/ota-social-engine-phase-8-governance-permissions.md`.

## Phase 9: Deployment

### Goal

Move from local file preview to a secure hosted command center.

### Standing Blindspot Strategy

Before Phase 9 deployment work, Codex must ask and answer:

> Based on what our goal is, what blindspots are we not seeing to achieve the ultimate goal?

This is a required gate for deployment, connector activation, credential handling, production-readiness claims, and external platform writes. The answer must identify pass, warning, and blocker conditions before implementation proceeds.

### Phase 9A: Deployment Blindspot Gate

Phase 9A is active and must happen before any deployment attempt.

The goal of 9A is to answer the magic question before hosting:

> Based on what our goal is, what blindspots are we not seeing to achieve the ultimate goal?

| Gate Item | Current State |
| --- | --- |
| Deployment status endpoint | Added `/api/deployment/status`. |
| UI visibility | Added `Phase 9A Deployment Blindspot Gate` panel in the status column. |
| Production build check | Reports whether `dist/app.html` exists. |
| Notion readiness | Reports missing token and data-source configuration. |
| Secret readiness | Reports whether hosted-safe secret key configuration exists. |
| Asset storage readiness | Warns when still using local filesystem storage. |
| Auth readiness | Blocks hosted production when no `OTA_ADMIN_TOKEN` or `AUTH_PROVIDER` is configured. |
| Deployment rule | No deploy without explicit user authorization after blindspot review. |

Supporting artifact: `ops/social-profile/ota-social-engine-phase-9a-deployment-blindspot-gate.md`.

### Phase 9B: Enterprise Hosting Architecture

Phase 9B selects the target architecture without deploying.

| Layer | Decision |
| --- | --- |
| Hosting | AWS App Runner or ECS Fargate for the Node app/API. |
| Primary database | Amazon RDS Postgres, with Multi-AZ for production. |
| Assets | Amazon S3 with versioning and encryption. |
| Secrets | AWS Secrets Manager or SSM Parameter Store. |
| Auth | Cognito, SSO, or a private admin-token gate for the first hosted MVP. |
| Audit | Postgres audit table plus S3 export snapshots. |
| Notion | Human-readable control plane, not the only transactional store. |

Phase 9B makes one hard ruling: do not use S3 as the primary database. S3 is for assets, exports, backups, evidence files, and snapshots. Transactional workflow state belongs in Postgres or a proper database.

Supporting artifact: `ops/social-profile/ota-social-engine-phase-9b-enterprise-hosting-architecture.md`.

### Phase 9C-1: Production Data Model

Phase 9C-1 defines the Postgres/RDS production data model without deploying infrastructure.

| Layer | Current State |
| --- | --- |
| Migration | Added `db/migrations/001_production_data_model.sql`. |
| Core tables | Brands, social platforms, social profiles, media assets, evidence, credential refs, Restream candidates, platform scans, users, roles, permissions, audit events, and sync outbox. |
| Secret policy | Secret values are not stored in Postgres; only secret refs are stored. |
| Asset policy | Files belong in S3; Postgres stores metadata and object refs only. |
| Audit policy | Every governed write should produce an audit event. |
| Sync policy | Notion and external sync should use `sync_outbox` for retry/dead-letter handling. |

Supporting artifact: `ops/social-profile/ota-social-engine-phase-9c-1-production-data-model.md`.

### Phase 9C-2: Production Persistence Adapter

Phase 9C-2 adds the persistence adapter boundary without provisioning RDS.

| Layer | Current State |
| --- | --- |
| Adapter contract | Added `server/persistenceAdapter.mjs`. |
| Local fallback | `local-json` remains the default development mode. |
| Status route | Added `GET /api/persistence/status`. |
| Export route | Added `GET /api/persistence/export` for migration planning. |
| Deployment gate | Added persistence adapter and Postgres/RDS configuration checks. |
| Postgres mode | Configuration/status only until the production repository layer is implemented. |

Supporting artifact: `ops/social-profile/ota-social-engine-phase-9c-2-production-persistence-adapter.md`.

### Steps

1. Choose hosting target.
2. Configure environment variables.
3. Configure Notion integration credentials.
4. Configure Restream credentials.
5. Configure storage and secret manager.
6. Add login/auth.
7. Add role-based access checks.
8. Add production logging.
9. Add backups/export flow.
10. Add deployment verification checklist.

### Deployment Checks

| Check | Required Result |
| --- | --- |
| App loads | Operator can open hosted command center |
| Notion read | Brands/profiles load from Notion |
| Notion write | Profile edits sync back to Notion |
| Asset upload | File uploads and metadata writes succeed |
| Evidence write | Evidence record creates successfully |
| Secret write | Secret ref is created without exposing value |
| Restream dry run | Candidate payload validates |
| Restream submit | Approved candidate can submit |
| Audit event | Every write creates an audit event |
| Permission check | Unauthorized users cannot submit or approve |

### Exit Criteria

The hosted app can be used as the official operator surface for OTA Social Engine work.

## Phase 10: Operating Rollout

### Goal

Move from build mode to working-platform mode.

### Steps

1. Run OTAP YouTube through the complete workflow.
2. Approve or reject avatar and banner candidates.
3. Resolve the Agentic Jey vs Own The Algo Podcast display-name decision.
4. Confirm MFA/recovery/security proof.
5. Confirm YouTube live eligibility.
6. Submit or defer Restream candidate.
7. Repeat for OTAP Instagram, Facebook Page, LinkedIn, TikTok, and Custom RTMP.
8. Repeat the same process for CRS, WYR, and The VFO.
9. Hold a platform-readiness review.
10. Mark the command center as official only after the workflow works end-to-end.

### Exit Criteria

The platform is official when at least one brand/platform profile has moved from sourced profile buildout through evidence, asset approval, connector approval, and Restream-connected or intentionally deferred status without manual database repair.

## Immediate Next Build Sprint

| Priority | Task | Owner |
| --- | --- | --- |
| P0 | Convert the local HTML prototype into an app shell | Codex |
| P0 | Add backend API routes for Notion read/write | Codex |
| P0 | Build Notion data-source config and sync adapter | Codex |
| P0 | Add profile update and evidence create flows | Codex |
| P0 | Add asset upload/storage decision and first implementation | Codex + Jey |
| P0 | Add secret-reference design before Restream writes | Codex + Jey |
| P1 | Add Restream candidate approval and dry-run validation | Codex |
| P1 | Add Restream submit endpoint | Codex |
| P1 | Populate OTAP YouTube end-to-end | Codex + Jey |
| P1 | Populate remaining OTAP P0 platforms | Codex |
| P2 | Expand to CRS, WYR, and The VFO | Codex + brand owners |

## Official Platform Gate

Do not call this the official working platform until all of the following are true:

1. Hosted app is available.
2. Notion is the live source of truth.
3. App can read and write Notion records.
4. Media files have durable storage.
5. Secret values are stored only in a secret manager.
6. Restream candidate approval is enforced.
7. Restream submission works through backend only.
8. Audit events are created for material changes.
9. Role boundaries are defined.
10. At least one brand/platform completes the full workflow.
