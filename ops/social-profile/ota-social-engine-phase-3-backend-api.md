# OTA Social Engine Phase 3 Backend API

## Status

Completed on 2026-06-30.

Phase 3 turns the Phase 2 app shell into a governed backend workflow. The browser remains the operator interface, but the backend now owns resource routes, readiness rules, audit events, secret-field rejection, and Restream submission blocking.

## What Phase 3 Added

| Area | Implementation |
| --- | --- |
| Backend routes | Added brand, profile, asset, evidence, audit, Restream candidate, and Notion status APIs. |
| Readiness engine | Added backend required-field, evidence, approval, connector, and publishing gate computation. |
| Secret protection | Added server-side rejection of plaintext streaming credentials and Restream tokens. |
| Sanitized responses | Added Restream candidate responses that expose secret references and booleans, not credential values. |
| Audit trail | Added audit event creation for profile, asset, evidence, Restream candidate, approval, submit-block, and manual audit actions. |
| Restream guardrail | Added a submit route that validates approval/readiness and then blocks external writes until the Phase 6 submit adapter exists. |
| Notion boundary | Added Notion status and sync-plan routes driven by environment configuration. |
| Platform guidance | Added explicit Facebook Page, LinkedIn, and TikTok guidance. |

## API Routes

| Route | Status | Purpose |
| --- | --- | --- |
| `GET /api/health` | Active | Returns service health, phase, mode, and Notion config status. |
| `GET /api/state` | Active | Returns full sanitized app state for the current frontend. |
| `POST /api/state/reset` | Active | Resets local state to the seeded dataset. |
| `GET /api/brands` | Active | Lists brands with profile counts and connector-ready counts. |
| `GET /api/brands/:slug` | Active | Returns one brand plus profile summaries. |
| `GET /api/profiles/:profileId` | Active | Returns one sanitized full profile. |
| `PATCH /api/profiles/:profileId` | Active | Updates profile fields and records an audit event. |
| `POST /api/profiles/:profileId/assets` | Active | Adds media asset metadata and records an audit event. |
| `POST /api/profiles/:profileId/evidence` | Active | Adds non-secret evidence and records an audit event. |
| `POST /api/profiles/:profileId/audit-events` | Active | Records a manual audit event. |
| `GET /api/assets` | Active | Lists flattened media asset metadata across profiles. |
| `GET /api/evidence` | Active | Lists flattened evidence metadata across profiles. |
| `GET /api/audit` | Active | Lists audit events. |
| `GET /api/restream/candidates` | Active | Lists sanitized Restream candidates. |
| `PATCH /api/restream/candidates/:candidateId` | Active | Updates a Restream candidate through candidate ID. |
| `POST /api/restream/candidates/:candidateId/approve` | Active | Records human approval through candidate ID. |
| `POST /api/restream/candidates/:candidateId/submit` | Guarded | Validates readiness, then blocks external submit until Phase 6. |
| `GET /api/notion/status` | Active | Returns Notion configuration status without exposing secrets. |
| `POST /api/notion/sync-plan` | Active | Returns a sync plan and record counts for future live Notion sync. |

## Backend Rules Now Enforced

| Rule | Phase 3 Behavior |
| --- | --- |
| Browser cannot store stream keys | Requests containing plaintext `streamKey` are rejected. |
| Browser cannot store stream URLs | Requests containing plaintext `streamUrl` are rejected. |
| Browser cannot store RTMP auth | Requests containing plaintext `rtmpUsername` or `rtmpPassword` are rejected. |
| Browser cannot store Restream tokens | Requests containing `restreamAccessToken` are rejected. |
| Readiness is computed server-side | Backend calculates missing required fields, evidence gates, approval gates, connector readiness, and publishing readiness. |
| Every state change needs an audit event | Backend writes audit rows for profile, asset, evidence, Restream, approval, and manual events. |
| Restream submit requires approval | Submit route rejects unapproved candidates. |
| Restream submit requires readiness | Submit route rejects candidates that fail backend readiness gates. |
| External Restream writes are not enabled yet | Submit route returns `restream_submit_not_enabled` until Phase 6. |

## Notion Boundary

Phase 3 does not perform live Notion writes. It adds the backend shape required for that work:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/notion/status` | Confirms whether `NOTION_TOKEN` and data source IDs are configured. |
| `POST /api/notion/sync-plan` | Shows the local records that would sync by database type and write order. |

The backend can now be wired to live Notion writes in a controlled way without exposing the Notion token to the browser.

## Current Security Posture

| Area | Current Mode |
| --- | --- |
| Secrets | Reference-only. No plaintext stream credentials should be stored. |
| Media | Metadata-only. File upload/storage begins in Phase 4. |
| Notion | Config/status boundary only. Live writes begin after explicit sync adapter work. |
| Restream | Candidate preparation and approval only. Submit adapter begins in Phase 6. |

## Verification

| Check | Result |
| --- | --- |
| Production build | Passed |
| `GET /api/health` | Passed |
| `GET /api/brands` | Passed |
| `GET /api/brands/otap` | Passed |
| `GET /api/restream/candidates` | Passed |
| Plaintext secret rejection | Passed |
| `POST /api/notion/sync-plan` | Passed |

## Next Phase

Phase 4 should add managed media asset storage. The upload flow should detect file type, image dimensions, video duration where relevant, durable storage reference, preview URL, approval state, and Notion asset-row mapping.
