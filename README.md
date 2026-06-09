# OTA Content Command Center MVP

HTML MVP plus a local backend action layer for launching and executing the OTA video workflow across campaign setup, scene planning, ElevenLabs script/audio generation, Codex + Remotion assembly, Higgsfield Studio generation, QA, final assembly, Descript enhancement, HeyGen avatar/lip-sync personalization, Bunny storage, Blotato publishing handoff, Restream live broadcast/clip capture, and repurpose planning.

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
- Creator day-in-the-life infographic for in-house review
- Workspace JSON export

## Next API Wiring

- Bunny.net storage upload and CDN URL creation after storage-zone credentials are added
- Server-side ElevenLabs audio generation after approved voice IDs, scripts, and spend approvals are attached
- Codex + Remotion automation hooks for creating the Higgsfield Studio input package
- Higgsfield generation jobs connected to approved Remotion outputs and prompt/source media payloads
- Blotato publishing draft creation after connected account selection, final media URL, caption package, and human approval
- Descript project handoff and enhanced asset tracking after Descript API access is available
- HeyGen OAuth MCP completion or `HEYGEN_API_KEY` fallback for avatar videos, lip-sync jobs, translations, and personalized variants; model routing is staged for Avatar IV by default and Avatar V only after avatar-look eligibility confirms `avatar_v`
- Restream event creation, chat websocket ingestion, and go-live actions after OAuth scopes, approval workflows, and live-event payloads are production backed
- Temporary testing database for team-wide campaign state
- Authentication and reviewer roles
- File upload surfaces for final video, thumbnails, captions, scene files, and approval docs

## Review Flow

Use any section's idea button or the top-bar "Got an Enhancement Idea?" link when a creator spots product improvement work. The dedicated enhancement page captures campaign, section, reviewer, priority, and request context before opening a prefilled GitHub issue draft in `ADMIOC/ota-content-command-center`. Use the Team Collaboration Hub for internal section threads, @mentions, reviewer status, and focus jumps before an idea needs public GitHub tracking.
