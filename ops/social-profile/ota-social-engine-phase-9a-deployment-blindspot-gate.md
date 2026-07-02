# OTA Social Engine Phase 9A Deployment Blindspot Gate

## Status

Phase 9A is active as a pre-deployment gate.

No external deployment should happen until this gate is reviewed and the production blockers are cleared or explicitly accepted.

## Magic Question

Based on what our goal is, what blindspots are we not seeing to achieve the ultimate goal?

For OTA Social Engine, the ultimate goal is not simply hosting a web app. The goal is to operate a multi-brand social-account command center that can safely coordinate brand profiles, assets, evidence, credentials, approvals, Restream connector work, and audit history.

## Standing Doctrine

The blindspot question is now a standing strategy for OTA Social Engine.

Use it before:

- Deployment decisions.
- Connector activation.
- Credential handling.
- Production-readiness claims.
- External platform writes.
- Cross-brand workflow changes.
- Healthcare-adjacent CRS workflow changes.
- Any action that could make an MVP appear operationally official before the controls are ready.

The question must be answered in pass, warning, and blocker terms before the work moves forward.

## Current Gate In The App

The app now surfaces a `Phase 9A Deployment Blindspot Gate` panel in the status column.

The gate classifies checks as:

| Status | Meaning |
| --- | --- |
| Pass | Ready enough for the current environment. |
| Warning | Acceptable for local MVP, but should be upgraded before official hosted production. |
| Blocker | Must be fixed before hosted production should be considered official. |

## Blindspots Being Checked

| Blindspot | Why It Matters | Gate |
| --- | --- | --- |
| Production build | Hosting without a current build can ship stale UI. | `dist/app.html` must exist. |
| Node server path | The app requires backend APIs; static hosting alone is not enough. | Server mode must be explicit. |
| State storage | Local JSON is not durable enough for hosted production. | State path must be intentional and backed up or replaced. |
| Notion token | Notion is the structured control plane. | `NOTION_TOKEN` must be configured before live Notion writes. |
| Notion data sources | The app needs stable structured destinations. | All required data-source IDs must be configured. |
| Secret-store key | Generated local keys are not deploy-safe. | `OTA_SECRET_STORE_KEY` or managed vault must be configured. |
| Asset storage | Local files can disappear on hosted platforms. | Durable object storage is required before official production. |
| Restream credential path | Connector actions depend on OAuth or token refs. | Restream must use either global token or per-profile OAuth secret refs. |
| Operator authentication | Phase 8 role simulation is not real identity. | `OTA_ADMIN_TOKEN` or `AUTH_PROVIDER` must be configured. |

## Current Expected Local Result

The local MVP may show blockers because it is intentionally not a production environment.

That is correct. The purpose of Phase 9A is to stop the team from treating a local MVP as the official hosted platform.

## Deployment Rule

Do not deploy until:

1. The Phase 9A panel is reviewed.
2. Every blocker has an owner and disposition.
3. The user explicitly authorizes deployment.
4. The target hosting path supports the backend API, persistent state, asset storage, secrets, and auth.
5. The blindspot question has been answered for the specific deployment target and operating model.

## Next Phase After 9A

Phase 9B should select the hosting architecture only after this gate is reviewed.

Candidate architecture decisions:

| Layer | Required Decision |
| --- | --- |
| App hosting | Node-capable host, not static-only hosting. |
| State | Notion-first live writes, database, or durable JSON with backup. |
| Assets | Durable object storage adapter. |
| Secrets | Managed vault or production-grade secret provider. |
| Auth | Admin token for private MVP or proper identity provider. |
| Audit | Durable append-only audit retention. |
