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
- scene `voiceoverScript` values only; this is the exact spoken narration sent to ElevenLabs
- non-spoken visual prompts and compliance notes as separate instructions, never merged into the TTS text
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

### Higgsfield Studio Service

Purpose: Generate or transform visual assets from approved Codex + Remotion outputs, source media, brand prompts, and campaign creative direction.

Inputs:
- campaign id
- Remotion output URL or source media reference
- Higgsfield prompt
- brand cinematic perspective
- approved script/audio context
- generation settings
- approval state

Outputs:
- Higgsfield job id
- generated image or video URLs
- generation status
- credit usage
- activity log event

Required approvals:
- human review before spending generation credits
- human review before raw outputs move into QA or publishing packages

### Bunny Storage Service

Purpose: Upload, organize, and expose approved media assets.

Required backend credentials:
- `BUNNY_ACCESS_KEY` or `BUNNY_API_KEY` for account-level API validation.
- `BUNNY_STORAGE_ZONE` and `BUNNY_STORAGE_PASSWORD` for storage upload automation.
- Account API validation alone is not enough to mark `POST /api/bunny/upload-manifest` production-ready.

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

Readiness endpoint:
- `GET /api/blotato/accounts`
- Server calls `GET https://backend.blotato.com/v2/users/me/accounts` with `blotato-api-key`.
- Response is sanitized to account id, platform, display name, username, and whether a page/subaccount id is needed.
- Publishing draft creation remains blocked until a connected account id, target platform, final media URL, caption package, and human approval are present.

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

### HeyGen Avatar Personalization Service

Purpose: Use HeyGen Remote MCP to create approved avatar-led explainers, lip-sync variants, personalized CTA videos, multilingual translations, and account brand-kit aware video outputs.

Model routing:
- Remote MCP authentication uses OAuth and does not require an API key.
- If MCP OAuth fails at grant time, use the official HeyGen CLI/API fallback with `HEYGEN_API_KEY`.
- The backend checks `HEYGEN_API_KEY` first, then MCP OAuth, then local HeyGen CLI auth status.
- New video generation should route through `POST /v3/videos`.
- Avatar IV is the default engine; omit `engine` unless a specific Avatar V look is eligible.
- Avatar V requires an eligibility check with `GET /v3/avatars/looks/{look_id}` and only works when `supported_api_engines` includes `avatar_v`.
- Avatar III is legacy-only and should not be used for new OTA Social Engine work.
- Avatar IV supports `studio_avatar`, `digital_twin`, `photo_avatar`, arbitrary `image`, and `prompt` avatar types.
- Avatar V supports eligible `studio_avatar`, `digital_twin`, `photo_avatar`, and `prompt` avatar types, but does not support arbitrary image input.

Inputs:
- campaign id
- approved script or audio reference
- approved source media URL when lip-sync or image animation is required
- avatar or voice preference
- brand kit or glossary reference
- translation targets when multilingual repurposing is required
- approval state

Outputs:
- HeyGen video id or agent session reference
- generated video URL
- lip-sync or translation job status
- avatar and voice metadata
- caption or translation references
- activity log event

Required approvals:
- human approval before generated avatar, lip-sync, translation, or personalized video enters publishing
- consent approval before creating or using digital twins, voice clones, or likeness-sensitive avatars
- regulated-brand review before public claims are preserved, translated, lip-synced, or personalized

Reference:
- https://developers.heygen.com/models
- https://developers.heygen.com/mcp/overview
- https://developers.heygen.com/docs/for-ai-agents
- https://developers.heygen.com/cli

### Restream Live Broadcast Service

Purpose: Prepare live broadcast metadata, track live session references, capture real-time viral clip candidates, and route public-response signals back into the repurpose loop.

Authentication model:
- Restream uses OAuth 2.0, not a single account API key.
- Required app credentials: `RESTREAM_CLIENT_ID`, `RESTREAM_CLIENT_SECRET`, and `RESTREAM_REDIRECT_URI`.
- Required token credentials after authorization: `RESTREAM_ACCESS_TOKEN` and `RESTREAM_REFRESH_TOKEN`.
- Backend validation uses `GET https://api.restream.io/v2/user/profile` with `Authorization: Bearer <token>`.
- Useful scopes for OTA: `profile.read`, `channels.read`, `stream.read`, `chat.read`, `storage.read`, and `clips.read`.
- Developer setup starts at https://developers.restream.io/guide/getting-started.

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

Readiness endpoints:
- `GET /api/integrations/status` reports whether the Restream OAuth app and token flow are configured.
- `GET /api/restream/oauth/start` returns the Restream authorization URL.
- `GET /api/restream/oauth/start?redirect=1` redirects the browser into the Restream authorization dialog.
- `GET /api/restream/oauth/callback` receives the authorization code, exchanges it for tokens, and stores the token pair in local Keychain.
- `GET /api/restream/operations` returns a combined read-only operational snapshot for channels, upcoming events, in-progress events, event history, storage files, and clip projects.
- `GET /api/restream/channels` lists connected Restream destination channels.
- `GET /api/restream/events/upcoming` lists upcoming Restream events. Optional query params: `source`, `scheduled`.
- `GET /api/restream/events/in-progress` lists currently live/in-progress Restream events.
- `GET /api/restream/events/history?page=1&limit=10` lists historical events.
- `GET /api/restream/events/:eventId` returns a specific Restream event.
- `GET /api/restream/events/:eventId/recordings` lists recordings for a Restream event.
- `POST /api/restream/events/:eventId/recordings/download-url` requests a temporary recording download URL for a `fileName`.
- `GET /api/restream/events/:eventId/analytics/viewers` returns viewer analytics when Restream has analytics for that event.
- `GET /api/restream/storage/files` lists Restream storage files.
- `GET /api/restream/clips/projects?limit=10` lists Restream clip projects. Optional query params: `cursor`, `sortBy`.
- `GET /api/restream/clips/projects/:projectId` returns a specific clip project.
- All Restream routes are read-only except the recording download URL helper and automatically refresh the stored OAuth token when Restream returns an expired-token response.
- Future live automation should add event creation, stream key handling, chat websocket ingestion, and explicit go-live actions after approval workflows are production backed.

## Future API Shape

```http
POST /api/elevenlabs/generate-audio
POST /api/remotion/render
POST /api/higgsfield/create-generation
POST /api/bunny/upload-manifest
POST /api/blotato/create-draft
POST /api/descript/create-edit
POST /api/heygen/create-avatar-video
POST /api/heygen/create-lipsync
POST /api/heygen/create-translation
POST /api/restream/create-broadcast
POST /api/restream/ingest-live-signals
POST /api/activity-log
GET /api/campaigns/:id/manifest
```

## Implementation Notes

- Current MVP server: `server.js`.
- Start local action mode with `npm start`, then open `http://127.0.0.1:4180/index.html`.
- The backend exposes `GET /api/health`, `GET /api/integrations/status`, `POST /api/jobs`, and `GET /api/jobs/:id`.
- Blotato account readiness is exposed through `GET /api/blotato/accounts`; no publish call is made by readiness checks.
- Copied integration manifests include workflow readiness, backend validation, and a combined `productionReady` boolean per service.
- The first job router is approval-gated by default. It stages paid or publishing work until approved execution payloads and required platform fields are available.
- Start with a minimal server that reads environment variables for credentials.
- Keep request bodies schema-validated.
- Store activity events in the production database before returning success.
- Return retryable statuses for long-running jobs instead of blocking the UI.
- Design every endpoint so the static app can safely call it without ever seeing secrets.
- Use the Command Center Integration Boundary Console and copied integration manifest as the front-end contract for initial server implementation.
