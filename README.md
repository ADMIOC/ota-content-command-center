# OTA Content Command Center MVP

Static HTML MVP for launching and executing the OTA video workflow across campaign setup, scene planning, Higgsfield generation, QA, final assembly, Bunny storage, and Blotato publishing handoff.

Open `index.html` in a browser. The app stores workspace data in `localStorage` and can export a JSON workspace file from the top bar.

Any database added during this MVP phase is temporary testing infrastructure only. It is not intended to be the production system of record.

## Current MVP

- Campaign launcher
- Eight-stage production workflow
- Stage owners, due dates, status, notes, and checklists
- Scene queue with Higgsfield prompt and compliance notes
- Human approval gate
- Bunny storage manifest
- Blotato publishing package
- Section-specific improvement requests with prefilled GitHub issue drafts
- Workspace JSON export

## Next API Wiring

- Bunny.net upload and CDN URL creation
- Blotato publishing draft creation
- Temporary testing database for team-wide campaign state
- Authentication and reviewer roles
- File upload surfaces for final video, thumbnails, captions, scene files, and approval docs

## Review Flow

Use any section's Comment button to target feedback to Campaign Overview, Workflow Stage, Scene Queue, Approval Gate, Bunny Storage, or Publishing Package. The Open GitHub Issue action creates a prefilled issue draft in `ADMIOC/ota-content-command-center` so review comments can be tracked publicly.
