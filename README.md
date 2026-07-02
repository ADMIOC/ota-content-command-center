# OTA Content Command Center MVP

HTML MVP plus a local backend action layer for launching and executing the OTA video workflow across campaign setup, scene planning, ElevenLabs script/audio generation, Codex + Remotion assembly, Higgsfield Studio generation, QA, final assembly, Descript enhancement, HeyGen avatar/lip-sync personalization, Bunny storage, Blotato publishing handoff, Restream live broadcast/clip capture, and repurpose planning.

It also includes the Phase 9C-2 Social Engine app/backend shell for social profile readiness, evidence capture, media asset storage, secret references, Restream channel validation, connector activation, governance, deployment readiness, hosting architecture, production data modeling, persistence adapters, and publishing handoff.

## DealFlow.Coach Backend Authority

The DealFlow.Coach frontend is subordinate to the institutional-grade backend.
Never limit, weaken, simplify, or reshape backend functionality to accommodate
frontend constraints. When frontend assumptions conflict with the backend's real
API contract, scoring model, evidence model, audit requirements, hard gates,
caps, clearances, or review logic, the frontend must be changed to match the
backend.

Open `index.html` in a browser. The app stores workspace data in `localStorage` and can export a JSON workspace file from the top bar.

For live backend actions, run:

```bash
npm start
```

Then open `http://127.0.0.1:4180/index.html`. Opening the file directly still works for static review, but API checks and backend jobs only run through the local server.

Restream OAuth can be started locally at `http://127.0.0.1:4180/api/restream/oauth/start?redirect=1` after the Restream client id, client secret, and redirect URI are available to the backend. Once authorized, read-only Restream operations are available through `/api/restream/operations`, `/api/restream/channels`, `/api/restream/events/upcoming`, `/api/restream/events/in-progress`, `/api/restream/events/history`, `/api/restream/storage/files`, and `/api/restream/clips/projects`.

Any database added during this MVP phase is temporary testing infrastructure only. It is not intended to be the production system of record.

## Operating Model

The long-term system map lives in [docs/ota-social-engine-operating-model.md](docs/ota-social-engine-operating-model.md). It defines OTA Social Engine as a 24/7/365 agentically engineered marketing operation across research, planning, production, publishing, communications, scaling, and monetization.

Secure API boundaries for future ElevenLabs, Remotion, Bunny, Blotato, Descript, HeyGen, and Restream services live in [docs/backend-integration-boundaries.md](docs/backend-integration-boundaries.md).

The official internal creator tutorial lives in [command-center-tutorial.html](command-center-tutorial.html). It explains the strategy and tactical use of every Content Command Center section for team adoption.

## Standing Blindspot Gate

Before any deployment, connector activation, credential workflow, production-readiness claim, or major architecture decision, the team must ask:

> Based on what our goal is, what blindspots are we not seeing to achieve the ultimate goal?

This is now a standing operating rule for OTA Social Engine work. Deployable is not the same as operationally official. The system must surface pass, warning, and blocker risks before moving profile, asset, evidence, credential, Restream, Notion, or cross-brand governance workflows into production use.

## OTA Social Engine Phase 9C-2

The Social Profile by Brand workflow now has a React app shell with a trusted backend API, server-side readiness gates, audit routes, Notion-sync status, local media uploads, encrypted local secret storage, Restream OAuth, connected-channel validation, connector activation tracking, role-based governance controls, a deployment blindspot gate, an enterprise-lite AWS target architecture, a Postgres production data model, a persistence adapter boundary, and file-backed local state for development.

Run it locally:

```bash
npm install
npm run dev:social
```

Open `http://localhost:5174/app.html`.

The Phase 9C-2 app stores working state in `data/social-engine-state.json`, uploaded media in `data/media-assets/`, and encrypted local secrets in `data/secrets/`, all intentionally ignored by git. Those local stores are not production state. The persistence adapter contract lives in `server/persistenceAdapter.mjs`; the production data model lives in `db/migrations/001_production_data_model.sql`. The static HTML prototype remains available at `social-profiles.html`.

## Current MVP

- Campaign launcher
- Sticky Command Center section map for faster creator navigation
- Eleven-stage production workflow with a dedicated HeyGen avatar personalization stage
- Outcome-first workflow labels with tool names preserved as subtitles
- Stage owners, due dates, status, notes, and checklists
- Readiness breakdown and next-action cue for creator adoption
- Creator Preview Studio for script, video, audio, thumbnail, and platform-format review
- Active-brand dropdown with an `Other` path for new brands
- Editable brand profile management
- Brand-tied creative direction drafts that creators can edit or regenerate
- Creative direction version history
- Regulated-brand compliance guardrails for CRS and The VFO
- Scene queue with video scripts, Higgsfield prompts, and compliance notes
- Live OTA Co-Pilot guidance for each campaign build section and dialog surface
- Agent Operations Layer with task queue, performance intelligence, repurpose candidates, Restream live ops, Descript enhancement, HeyGen avatar personalization, and approval console
- Local backend action layer with `/api/health`, `/api/integrations/status`, and `/api/jobs` for credential-aware, trackable agent work
- Blotato connected-account readiness check with `/api/blotato/accounts` before publishing draft automation
- Secure Integration Boundary Console for server-side ElevenLabs, Remotion, Higgsfield, Bunny, Blotato, Descript, HeyGen, and Restream API readiness
- Agent activity log
- ElevenLabs script/audio tracking for the active `agentic@ownthealgo.com` account
- Codex + Remotion handoff tracking for the output Higgsfield Studio ingests
- Descript enhancement strategy for stitched, polished, avatar/audio/video assets
- HeyGen avatar, lip-sync, translation, and personalized CTA strategy
- Human approval gate
- Bunny storage manifest
- Blotato publishing package
- Publishing Calendar for platform-specific schedule slots and status control
- Standalone Viral Launch Control page for hook scoring, manual posting readiness, and copyable launch packets
- Launch Readiness Agent actions for handling open viral launch gates from the launch page
- Viral Launch Control infographic guide for creator adoption and no-guesswork posting handoff
- Restream live broadcast and real-time viral clip strategy
- Dedicated "Got an Enhancement Idea?" intake page with section-specific GitHub issue drafts
- Team Collaboration Hub with section threads, reviewer roles, @mentions, focus jumps, and status controls
- Official section-by-section creator tutorial for internal adoption
- Restream MCP connector runbook in `ops/connectors/RESTREAM_MCP_CONNECTOR.md`
- Section-specific improvement requests with prefilled GitHub issue drafts
- Creator day-in-the-life infographic for in-house review
- Workspace JSON export
- OTAP Social Account Launchpad Loop demo in `ops/loops/OTAP_SOCIAL_ACCOUNT_LAUNCHPAD_LOOP_DEMO.md`
- Social Profile by Brand frontend scope in `ops/social-profile/social-profile-by-brand-frontend-scope.md`
- Static Social Profile by Brand MVP in `social-profiles.html`
- Phase 9C-2 Social Engine app in `app.html`, `src/`, and `server/`
- Phase 7 connector activation and brand buildout note in `ops/social-profile/ota-social-engine-phase-7-connector-activation-brand-buildout.md`
- Phase 8 governance and permissions note in `ops/social-profile/ota-social-engine-phase-8-governance-permissions.md`
- Phase 9A deployment blindspot gate note in `ops/social-profile/ota-social-engine-phase-9a-deployment-blindspot-gate.md`
- Phase 9B enterprise hosting architecture note in `ops/social-profile/ota-social-engine-phase-9b-enterprise-hosting-architecture.md`
- Phase 9C-1 production data model note in `ops/social-profile/ota-social-engine-phase-9c-1-production-data-model.md`
- Phase 9C-2 production persistence adapter note in `ops/social-profile/ota-social-engine-phase-9c-2-production-persistence-adapter.md`
- Notion Social Account Command Center control plane: `https://app.notion.com/p/38fa90a45ed78194ad95d43d43d39d4f`

## Next API Wiring

- Bunny.net storage upload and CDN URL creation after storage-zone credentials are added
- Server-side ElevenLabs audio generation after approved voice IDs, scripts, and spend approvals are attached
- Codex + Remotion automation hooks for creating the Higgsfield Studio input package
- Higgsfield generation jobs connected to approved Remotion outputs and prompt/source media payloads
- Blotato publishing draft creation after connected account selection, final media URL, caption package, and human approval
- Descript project handoff and enhanced asset tracking after Descript API access is available
- HeyGen OAuth MCP completion or `HEYGEN_API_KEY` fallback for avatar videos, lip-sync jobs, translations, and personalized variants; model routing is staged for Avatar IV by default and Avatar V only after avatar-look eligibility confirms `avatar_v`
- Restream event creation, chat websocket ingestion, and go-live actions after OAuth scopes, approval workflows, and live-event payloads are production backed
- Restream broadcast readiness, recording retrieval, and analytics checks
- Social Profile by Brand database and Restream manual channel creation workflow
- Live Notion writes for the Phase 6 Social Engine API
- Durable Drive/cloud asset storage adapter for uploaded media
- Production secret-store adapter for Restream credentials
- Media upload storage and secret reference storage
- Temporary testing database for team-wide campaign state
- Authentication and reviewer roles
- File upload surfaces for final video, thumbnails, captions, scene files, and approval docs

## Review Flow

Use any section's idea button or the top-bar "Got an Enhancement Idea?" link when a creator spots product improvement work. The dedicated enhancement page captures campaign, section, reviewer, priority, and request context before opening a prefilled GitHub issue draft in `ADMIOC/ota-content-command-center`. Use the Team Collaboration Hub for internal section threads, @mentions, reviewer status, and focus jumps before an idea needs public GitHub tracking.
