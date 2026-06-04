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

## Future API Shape

```http
POST /api/elevenlabs/generate-audio
POST /api/remotion/render
POST /api/bunny/upload-manifest
POST /api/blotato/create-draft
POST /api/activity-log
GET /api/campaigns/:id/manifest
```

## Implementation Notes

- Start with a minimal server that reads environment variables for credentials.
- Keep request bodies schema-validated.
- Store activity events in the production database before returning success.
- Return retryable statuses for long-running jobs instead of blocking the UI.
- Design every endpoint so the static app can safely call it without ever seeing secrets.
