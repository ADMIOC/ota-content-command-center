# OTA Social Engine Phase 2 Buildout

## Status

Completed on 2026-06-30.

Phase 2 converts the Social Profile by Brand static HTML prototype into a local working app with a backend API boundary. It is ready for operator testing against local file-backed state.

## What Phase 2 Added

| Area | Implementation |
| --- | --- |
| Frontend | React app served from `app.html` |
| Backend | Express API in `server/index.mjs` |
| Dev server | `npm run dev` at `http://localhost:5174/app.html` |
| Build command | `npm run build` |
| State store | Local JSON file at `data/social-engine-state.json` |
| Seed data | Four brands and six platform profiles per brand |
| Static fallback | Original prototype remains at `social-profiles.html` |

## Operating Model

The Phase 2 app is the operator-facing workspace for assembling social profile readiness by brand. The user can select a brand, select a social platform, update profile fields, record media asset metadata, add evidence, and prepare a Restream manual channel candidate.

The app is intentionally human-led. It supports readiness, evidence, approval, and connector preparation. It does not create bulk social accounts, bypass platform verification, or submit Restream channels without a later secured backend phase.

## Manual Workflow

| Step | Section | Purpose |
| --- | --- | --- |
| Step 1 | Profile Elements | Capture handle, profile URL, display name, bio, website, asset references, and operator notes. |
| Step 2 | Media Asset Library | Record profile images, banners, videos, screenshots, and other platform media references with platform-specific dimension guidance. |
| Step 3 | Evidence Vault | Record non-secret proof that the account is owned, secured, reviewed, and ready for connector work. |
| Step 4 | Restream Manual Configuration | Prepare the Restream channel candidate while storing only secret references, not plaintext secrets. |

## Seeded First Work Item

Own The Algo Podcast YouTube is seeded as the first working profile:

| Field | Value |
| --- | --- |
| Brand | Own The Algo Podcast |
| Platform | YouTube |
| Confirmed handle | `@ownthealgo` |
| Profile URL | `https://www.youtube.com/@ownthealgo` |
| Display name | Agentic Jey |
| Website | `https://podcast.ownthealgo.com` |
| Ownership state | Claimed |
| Security state | Incomplete |
| Profile state | Needs Review |
| Connector state | None |

## API Routes

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Confirms the local service is running. |
| `GET /api/state` | Returns the full local working state. |
| `POST /api/state/reset` | Resets local working state to the seeded Phase 2 dataset. |
| `PATCH /api/profiles/:profileId` | Updates profile fields. |
| `POST /api/profiles/:profileId/assets` | Adds media asset metadata. |
| `POST /api/profiles/:profileId/evidence` | Adds evidence metadata. |
| `PATCH /api/profiles/:profileId/restream-candidate` | Updates Restream candidate fields. |
| `POST /api/profiles/:profileId/restream-candidate/approve` | Records local human approval. |

## Local Runbook

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5174/app.html
```

Build verification:

```bash
npm run build
```

## Phase 2 Verification

| Check | Result |
| --- | --- |
| Dependencies installed | Passed |
| Production build | Passed |
| `GET /api/health` | Passed |
| `GET /api/state` | Passed |
| Dev server | Running locally on port 5174 |

## Explicit Non-Goals

Phase 2 does not include live Notion sync, live media uploads, secret vault integration, OAuth handling, or Restream channel submission.

These are deferred so each external boundary can be secured and audited before production use.

## Next Phase

Phase 3 should wire the backend to Notion as the structured control plane. The backend should translate between the app state model and the six Notion databases without exposing Notion credentials to the browser.
