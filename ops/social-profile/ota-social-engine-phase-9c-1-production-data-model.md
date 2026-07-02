# OTA Social Engine Phase 9C-1 Production Data Model

## Status

Phase 9C-1 is the production data-model phase. It does not deploy infrastructure.

The output is a Postgres schema designed for Amazon RDS and a migration path away from local JSON as the production state source.

## Blindspot Question

Based on what our goal is, what blindspots are we not seeing to achieve the ultimate goal?

The main blindspot is designing the database as a copy of the current UI. OTA Social Engine needs a durable operating model for brands, profiles, assets, evidence, credentials, approvals, Restream candidates, roles, permissions, audit events, and sync state.

## Migration Artifact

Primary migration:

`db/migrations/001_production_data_model.sql`

## Data Model

| Table | Purpose |
| --- | --- |
| `brands` | Brand identity, ownership, priority, governance boundary, and no-PHI flag. |
| `social_platforms` | Platform catalog, Restream IDs, required fields, and platform guidance. |
| `social_profiles` | One brand/platform operating profile with readiness and publishing states. |
| `media_assets` | Controlled source assets, observed platform assets, S3 refs, dimensions, and approval status. |
| `evidence_records` | Ownership, security, profile, approval, connector, and proof-file records. |
| `credential_refs` | Secret references only. No plaintext secrets. |
| `restream_candidates` | Restream manual/connected channel candidate state, secret ref links, approval, validation, and submission refs. |
| `platform_scans` | Sanitized scan output and scan counts. |
| `app_users` | Real operator identities once auth is added. |
| `roles` | Governance roles. |
| `permissions` | Atomic permissions. |
| `role_permissions` | Role-to-permission mapping. |
| `user_brand_roles` | Brand-scoped user roles. |
| `audit_events` | Durable audit trail for writes, approvals, sync, connector actions, and governance events. |
| `sync_outbox` | Reliable sync queue for Notion and external targets. |

## Production Rules

1. Store workflow state in Postgres, not S3.
2. Store media and proof files in S3, not Postgres.
3. Store secret values in AWS Secrets Manager or SSM Parameter Store, not Postgres.
4. Store only secret references in `credential_refs`.
5. Use `audit_events` for every write that changes profile, asset, evidence, secret-ref, connector, role, or sync state.
6. Use `sync_outbox` for Notion and external sync so failed writes are retryable.
7. Use `user_brand_roles` to keep CRS, OTAP, WYR, and The VFO permissions separated.

## Initial Schema Decisions

| Decision | Reason |
| --- | --- |
| UUID primary keys | Works cleanly across app, Notion sync, and future distributed workers. |
| `external_key` fields | Allows migration from local IDs and Notion IDs without treating them as internal primary keys. |
| JSONB metadata | Allows platform-specific details without schema churn. |
| Explicit role/permission tables | Phase 8 simulated roles can graduate into real auth. |
| Audit table independent of active records | Audit history should survive record changes and deletion. |
| Sync outbox table | Notion and external platform writes need retry and dead-letter handling. |

## Phase 9C-1 Pass/Warn/Block

| Area | Status | Reason |
| --- | --- | --- |
| Core workflow schema | Pass | Brands, platforms, profiles, assets, evidence, Restream candidates, and audit events are covered. |
| Secret handling | Pass | Schema stores refs only and has no plaintext secret columns. |
| Asset storage | Pass | Schema stores S3 refs and metadata, not binary files. |
| Auth readiness | Pass | User, role, permission, and brand-role tables are present. |
| Live migration | Warn | Migration script exists, but local JSON export/import tooling is still needed. |
| RDS provisioning | Block | No AWS database has been provisioned yet. |
| App persistence adapter | Block | The Node app still reads/writes local JSON. |

## Next Step

Phase 9C-2 should add a production persistence adapter plan or implementation path:

- Postgres connection configuration.
- Repository functions for brands, profiles, assets, evidence, Restream candidates, and audit events.
- Local JSON fallback preserved for development.
- Migration script to import the current local state.

