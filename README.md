# OTA Content Command Center MVP

Static HTML MVP for launching and executing the OTA video workflow across campaign setup, scene planning, ElevenLabs script/audio generation, Codex + Remotion assembly, Higgsfield Studio generation, QA, final assembly, Bunny storage, and Blotato publishing handoff.

Open `index.html` in a browser. The app stores workspace data in `localStorage` and can export a JSON workspace file from the top bar.

Any database added during this MVP phase is temporary testing infrastructure only. It is not intended to be the production system of record.

## Current MVP

- Campaign launcher
- Ten-stage production workflow
- Stage owners, due dates, status, notes, and checklists
- Active-brand dropdown with an `Other` path for new brands
- Brand-tied creative direction drafts that creators can edit or regenerate
- Regulated-brand compliance guardrails for CRS and The VFO
- Scene queue with Higgsfield prompt and compliance notes
- ElevenLabs script/audio tracking for the active `agentic@ownthealgo.com` account
- Codex + Remotion handoff tracking for the output Higgsfield Studio ingests
- Human approval gate
- Bunny storage manifest
- Blotato publishing package
- Section-specific improvement requests with prefilled GitHub issue drafts
- Creator day-in-the-life infographic for in-house review
- Workspace JSON export

## Next API Wiring

- Bunny.net upload and CDN URL creation
- Server-side ElevenLabs API wiring for script/audio generation without exposing keys in the static client
- Codex + Remotion automation hooks for creating the Higgsfield Studio input package
- Blotato publishing draft creation
- Temporary testing database for team-wide campaign state
- Authentication and reviewer roles
- File upload surfaces for final video, thumbnails, captions, scene files, and approval docs

## Review Flow

Use any section's Comment button to target feedback to Campaign Overview, Workflow Stage, Scene Queue, Approval Gate, Bunny Storage, or Publishing Package. The Open GitHub Issue action creates a prefilled issue draft in `ADMIOC/ota-content-command-center` so review comments can be tracked publicly.
