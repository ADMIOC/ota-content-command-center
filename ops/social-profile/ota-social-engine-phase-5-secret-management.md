# OTA Social Engine Phase 5 Secret Management

## Status

Completed on 2026-06-30.

Phase 5 adds a backend-only secret-reference flow for streaming credentials. Operators can enter sensitive values once, the backend stores them encrypted, and the app state receives only a `secret://...` reference.

## Storage Decision

Phase 5 uses local encrypted storage first:

```text
data/secrets/
data/secret-store.key
```

Both paths are ignored by git. This is suitable for local operator validation. A production adapter such as 1Password, Doppler, AWS Secrets Manager, Google Secret Manager, or another approved vault can replace the local storage implementation later.

## Secret Reference Format

```text
secret://ota-social-engine/{brand}/{platform}/{credential}
```

Example:

```text
secret://ota-social-engine/otap/youtube/stream-key
```

## What Phase 5 Added

| Area | Implementation |
| --- | --- |
| Secret store helper | `server/secretStore.mjs` |
| Secret write route | `POST /api/profiles/:profileId/secrets` |
| Secret rotation route | `POST /api/profiles/:profileId/secrets/:credentialType/rotate` |
| Secret status route | `GET /api/secrets/status` |
| Health status | `GET /api/health` now reports `phase: 5` and secret-store mode |
| Candidate linkage | Stored refs update Restream candidate secret-ref fields |
| Frontend controls | Step 4 Credential Vault |
| Audit trail | Secret write and rotation events are recorded without exposing values |

## Supported Credential Types

| Credential Type | Candidate Field |
| --- | --- |
| `streamUrl` | `streamUrlSecretRef` |
| `streamKey` | `streamKeySecretRef` |
| `rtmpUsername` | `rtmpUsernameSecretRef` |
| `rtmpPassword` | `rtmpPasswordSecretRef` |

## Backend Rules

| Rule | Behavior |
| --- | --- |
| No plaintext credential persistence in app state | Candidate records store only secret refs. |
| No plaintext credentials in Notion-ready state | `/api/state` responses include refs and booleans, not values. |
| No plaintext credentials in general candidate routes | Existing profile and candidate update routes reject plaintext credential fields. |
| Secret values are accepted only by secret routes | Secret routes store values and return refs. |
| Secret values are encrypted locally | Values are stored as AES-256-GCM ciphertext. |
| Secret events are audited | Audit records describe the credential type only, never the value. |

## Operator Workflow

1. Open Step 4 Restream Manual Configuration.
2. Choose the credential type in Credential Vault.
3. Enter the sensitive value once.
4. Click `Store Secret Ref`.
5. Confirm the relevant stored indicator changes from Missing to Stored.
6. Continue Restream candidate approval using only the returned reference.

## Verification

| Check | Result |
| --- | --- |
| `npm run build` | Passed |
| `GET /api/health` | Passed with `phase: 5` and local encrypted secret mode |
| `GET /api/secrets/status` | Passed |
| Secret write route | Passed |
| Candidate ref update | Passed |
| Plaintext candidate patch rejection | Still passed |
| Browser UI | Rendered Credential Vault with no console warnings/errors |

## Remaining Secret Work

| Future Work | Phase |
| --- | --- |
| Production secret manager adapter | Production hardening |
| Operator authentication and authorization | Production hardening |
| Secret resolution for Restream submit | Phase 6 |
| Secret stale/rotation status UI | Phase 6 or production hardening |
| Formal access-control policy | Production hardening |
