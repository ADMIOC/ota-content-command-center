# Backend Integration Boundaries

This document defines the secure service boundaries for future OTA Social Engine platform integrations. The static Content Command Center may display state, collect inputs, and export manifests, but it must not hold API keys or perform privileged calls directly.

## Boundary Rules

- API keys, service tokens, webhook secrets, signing secrets, and storage credentials stay server-side.
- Every automated action must write an activity event that includes actor, action, campaign, input reference, output reference, timestamp, and approval state.
- Publishing, paid actions, credential changes, and regulated-brand claims require explicit human approval before execution.
- Backend services should accept structured campaign manifests, not loose prompt strings.
- All generated assets should return stable URLs and metadata that can be stored in the workspace manifest.

## Service Contracts

### ElevenLabs Service

Purpose: Generate voice/audio tracks from approved scene scripts and brand voice settings.

Inputs:
- campaign id
- brand profile id
- scene scripts
- voice profile
- pronunciation notes
- compliance guardrails

Outputs:
- audio track URLs
- voice profile used
- character/credit usage
- generation status
- activity log event

Required approvals:
- regulated-brand compliance approval before generation
- human approval before audio is sent downstream

### Remotion Service

Purpose: Ingest ElevenLabs script/audio output and create the production input for Higgsfield Studio.

Inputs:
- campaign id
- scene scripts
- ElevenLabs audio track URLs
- caption timing instructions
- composition notes
- brand cinematic perspective

Outputs:
- Remotion preview URL
- Remotion output URL
- caption timing metadata
- render status
- activity log event

Required approvals:
- human review before Higgsfield handoff

### Bunny Storage Service

Purpose: Upload, organize, and expose approved media assets.

Inputs:
- campaign id
- brand
- folder path
- final video
- thumbnail
- scripts
- audio tracks
- Remotion output
- captions
- approval docs

Outputs:
- CDN URLs
- folder manifest
- upload status
- activity log event

Required approvals:
- final package review before publishing handoff

### Blotato Publishing Service

Purpose: Create publishing drafts from approved media packages.

Inputs:
- final media URL
- thumbnail URL
- caption
- hashtags
- platform notes
- target platforms
- scheduling instructions

Outputs:
- publishing draft IDs
- draft URLs
- scheduled status
- activity log event

Required approvals:
- explicit human approval before publishing or scheduling

### Descript Editorial Service

Purpose: Hand off approved video/audio assets for stitching, transcript-aware editing, audio cleanup, avatar/video enhancement, and rapid polish using Descript's on-platform agents.

Inputs:
- campaign id
- source media URLs
- transcript or script references
- brand profile
- edit instructions
- caption and platform requirements
- approval state

Outputs:
- Descript project reference
- enhanced video URL
- enhanced audio URL
- transcript or edit notes
- repurpose candidate timestamps
- activity log event

Required approvals:
- human approval before enhanced assets enter publishing
- regulated-brand review before public claims are preserved or amplified

### Restream Live Broadcast Service

Purpose: Prepare live broadcast metadata, track live session references, capture real-time viral clip candidates, and route public-response signals back into the repurpose loop.

Inputs:
- campaign id
- live broadcast title and description
- approved media or run-of-show references
- platform targets
- host notes
- caption/clip instructions
- approval state

Outputs:
- Restream event or session reference
- live broadcast status
- real-time clip references
- live engagement notes
- repurpose candidate list
- activity log event

Required approvals:
- explicit human approval before going live
- regulated-brand review before live talking points or clipped claims are approved for reuse

## Future API Shape

```http
POST /api/elevenlabs/generate-audio
POST /api/remotion/render
POST /api/bunny/upload-manifest
POST /api/blotato/create-draft
POST /api/descript/create-edit
POST /api/restream/create-broadcast
POST /api/restream/ingest-live-signals
POST /api/activity-log
GET /api/campaigns/:id/manifest
```

## Implementation Notes

- Start with a minimal server that reads environment variables for credentials.
- Keep request bodies schema-validated.
- Store activity events in the production database before returning success.
- Return retryable statuses for long-running jobs instead of blocking the UI.
- Design every endpoint so the static app can safely call it without ever seeing secrets.
- Use the Command Center Integration Boundary Console and copied integration manifest as the front-end contract for initial server implementation.
