# OTA Social Engine Phase 6 Restream Integration

## Status

Completed on 2026-06-30.

Phase 6 adds a gated Restream channel-submit adapter. The platform can now generate sanitized dry-run payloads, validate candidate readiness, resolve `secret://...` references inside the backend, and submit to Restream only when approval, readiness, secret refs, and `RESTREAM_ACCESS_TOKEN` are present.

## Restream Contract

| Item | Value |
| --- | --- |
| Endpoint | `POST https://api.restream.io/v2/user/channels` |
| Required scope | `channels.write` |
| Backend token | `RESTREAM_ACCESS_TOKEN`, `restreamAccessTokenSecretRef`, or refreshed OAuth token refs |
| Submit mode | Gated live submit when token and readiness are present |
| Dry-run mode | Sanitized payload preview with no secret resolution or external write |

## What Phase 6 Added

| Area | Implementation |
| --- | --- |
| Restream adapter | `server/restreamAdapter.mjs` |
| Integration status | `GET /api/health` includes Restream readiness |
| Dry-run route | `POST /api/restream/candidates/:candidateId/dry-run` |
| Submit route | `POST /api/restream/candidates/:candidateId/submit` |
| Secret resolution | Submit resolves secret refs server-side only |
| Payload validation | Platform ID, display name, required secret refs, approval, and readiness |
| Frontend controls | Step 4 Dry Run and Submit to Restream |
| Sanitized response handling | Credential-like fields are redacted before storage/response |
| Audit trail | Dry-run and submit actions are recorded |

## Supported Manual Platforms

| Platform ID | Platform | Required Secret Refs | Optional Secret Refs |
| --- | --- | --- | --- |
| `29` | Custom RTMP | `streamUrlSecretRef` | `streamKeySecretRef`, `rtmpUsernameSecretRef`, `rtmpPasswordSecretRef` |
| `72` | Telegram | `streamUrlSecretRef`, `streamKeySecretRef` | None |
| `73` | Instagram | `streamKeySecretRef` | None |
| `79` | Substack | `streamKeySecretRef` | None |

## Submit Gates

| Gate | Behavior |
| --- | --- |
| Human approval | Candidate must be approved before submit. |
| Backend readiness | Required fields, ownership, security, profile, and approval gates must pass. |
| Payload validation | Platform ID, display name, and required secret refs must be present. |
| Secret resolution | Required `secret://...` refs must resolve in the backend secret store. |
| Restream token | `RESTREAM_ACCESS_TOKEN` must be configured, the candidate must have `restreamAccessTokenSecretRef`, or the candidate must have client ID, client secret, and refresh-token refs. |
| Restream scope | The access token must include `channels.write`; refresh does not add scopes that were not granted during authorization. |
| Sanitization | Restream response is sanitized before storage or frontend return. |

## Operator Workflow

1. Complete profile readiness and evidence gates.
2. Store stream credentials through Step 4 Credential Vault.
3. Save the Restream candidate.
4. Approve the candidate.
5. Run Dry Run to confirm the sanitized payload and blockers.
6. Store the Restream OAuth credentials through Credential Vault: `Restream Client ID`, `Restream Client Secret`, and `Restream Refresh Token`.
7. Use `Refresh OAuth Token` to rotate access/refresh tokens through the backend.
8. Confirm the resulting token scope includes `channels.write` before submitting an Add Channel request.
7. Review the sanitized response and audit trail.

## Verification

| Check | Result |
| --- | --- |
| `npm run build` | Passed |
| `GET /api/health` | Passed with `phase: 6` |
| `GET /api/health` Restream status | Passed, reports token readiness and `channels.write` scope |
| Dry-run route | Passed |
| OAuth refresh route | Implemented as `POST /api/restream/candidates/:candidateId/oauth/refresh` |
| Submit route without approval | Passed, blocked with HTTP `409` |
| Submit route without token | Guarded by `restream_access_token_missing` after approval/readiness gates |
| Browser UI | Rendered Dry Run and Submit controls without console warnings/errors |

## Remaining Work

| Future Work | Phase |
| --- | --- |
| Store a Restream refresh token through Credential Vault | Operator setup |
| End-to-end live channel submit | First approved candidate |
| Notion writeback for Restream channel ID | Live Notion sync phase |
| One-submit lock and retry queue | Production hardening |
| Connector health checks after channel creation | Production hardening |

## Source

Restream channel-add documentation: `https://developers.restream.io/channels/channel-add`
