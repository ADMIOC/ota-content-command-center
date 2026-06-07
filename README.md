# OTA Content Command Center MVP

Static HTML MVP for launching and executing the OTA video workflow across campaign setup, scene planning, ElevenLabs script/audio generation, Codex + Remotion assembly, Higgsfield Studio generation, QA, final assembly, Descript enhancement, Bunny storage, Blotato publishing handoff, Restream live broadcast/clip capture, and repurpose planning.

Open `index.html` in a browser. The app stores workspace data in `localStorage` and can export a JSON workspace file from the top bar.

Any database added during this MVP phase is temporary testing infrastructure only. It is not intended to be the production system of record.

## Operating Model

The long-term system map lives in [docs/ota-social-engine-operating-model.md](docs/ota-social-engine-operating-model.md). It defines OTA Social Engine as a 24/7/365 agentically engineered marketing operation across research, planning, production, publishing, communications, scaling, and monetization.

Secure API boundaries for future ElevenLabs, Remotion, Bunny, Blotato, Descript, and Restream services live in [docs/backend-integration-boundaries.md](docs/backend-integration-boundaries.md).

The official internal creator tutorial lives in [command-center-tutorial.html](command-center-tutorial.html). It explains the strategy and tactical use of every Content Command Center section for team adoption.

## Current MVP

- Campaign launcher
- Sticky Command Center section map for faster creator navigation
- Ten-stage production workflow
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
- Agent Operations Layer with task queue, performance intelligence, repurpose candidates, Restream live ops, Descript enhancement, and approval console
- Secure Integration Boundary Console for server-side ElevenLabs, Remotion, Bunny, Blotato, Descript, and Restream API readiness
- Agent activity log
- ElevenLabs script/audio tracking for the active `agentic@ownthealgo.com` account
- Codex + Remotion handoff tracking for the output Higgsfield Studio ingests
- Descript enhancement strategy for stitched, polished, avatar/audio/video assets
- Human approval gate
- Bunny storage manifest
- Blotato publishing package
- Publishing Calendar for platform-specific schedule slots and status control
- Viral Launch Control for hook scoring, manual posting readiness, and copyable launch packets
- Restream live broadcast and real-time viral clip strategy
- Dedicated "Got an Enhancement Idea?" intake page with section-specific GitHub issue drafts
- Team Collaboration Hub with section threads, reviewer roles, @mentions, focus jumps, and status controls
- Official section-by-section creator tutorial for internal adoption
- Creator day-in-the-life infographic for in-house review
- Workspace JSON export

## Next API Wiring

- Bunny.net upload and CDN URL creation
- Server-side ElevenLabs API wiring for script/audio generation without exposing keys in the static client
- Codex + Remotion automation hooks for creating the Higgsfield Studio input package
- Blotato publishing draft creation
- Descript project handoff and enhanced asset tracking
- Restream live broadcast and viral clip signal ingestion
- Temporary testing database for team-wide campaign state
- Authentication and reviewer roles
- File upload surfaces for final video, thumbnails, captions, scene files, and approval docs

## Review Flow

Use any section's idea button or the top-bar "Got an Enhancement Idea?" link when a creator spots product improvement work. The dedicated enhancement page captures campaign, section, reviewer, priority, and request context before opening a prefilled GitHub issue draft in `ADMIOC/ota-content-command-center`. Use the Team Collaboration Hub for internal section threads, @mentions, reviewer status, and focus jumps before an idea needs public GitHub tracking.
