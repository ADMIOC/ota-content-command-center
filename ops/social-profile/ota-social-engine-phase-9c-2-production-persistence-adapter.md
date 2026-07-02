# OTA Social Engine Phase 9C-2 Production Persistence Adapter

## Status

Phase 9C-2 adds the persistence adapter boundary. It does not provision RDS and does not deploy.

The app still runs on the proven local JSON fallback by default. Phase 9C-2 adds the adapter contract, status surface, and export route so the production Postgres repository can be implemented without guessing about migration shape.

## Blindspot Question

Based on what our goal is, what blindspots are we not seeing to achieve the ultimate goal?

The blindspot is treating Postgres as a simple file replacement. Production persistence is an operating boundary: it must support transactional writes, audit, sync retries, migration from local JSON, and future multi-operator access without leaking secrets or cross-brand data.

## Adapter Artifact

Primary adapter:

`server/persistenceAdapter.mjs`

## Active Behavior

| Mode | Behavior |
| --- | --- |
| `local-json` | Reads and writes `data/social-engine-state.json`. This remains the default development mode. |
| `postgres` | Reserved for the production repository implementation. The current contract reports readiness/configuration but does not claim RDS is live. |

## New Routes

| Route | Purpose |
| --- | --- |
| `GET /api/persistence/status` | Reports active persistence mode, local fallback status, and Postgres configuration state. |
| `GET /api/persistence/export` | Exports current local state plus counts for migration planning. |
| `GET /api/deployment/status` | Now includes persistence adapter and Postgres/RDS configuration checks. |

## Environment

| Variable | Purpose |
| --- | --- |
| `PERSISTENCE_MODE` | `local-json` or `postgres`. |
| `OTA_SOCIAL_STATE_PATH` | Local JSON fallback state path. |
| `DATABASE_URL` | Preferred Postgres/RDS connection string. |
| `PGHOST` | Alternate Postgres host configuration. |
| `PGDATABASE` | Alternate Postgres database name. |
| `PGUSER` | Alternate Postgres user. |
| `PGPASSWORD` | Alternate Postgres password. |
| `PGPORT` | Alternate Postgres port. |

## Pass/Warn/Block

| Area | Status | Reason |
| --- | --- | --- |
| Adapter contract | Pass | `server/persistenceAdapter.mjs` defines the production persistence contract and status model. |
| Local development fallback | Pass | Existing app behavior remains stable. |
| Migration export | Pass | Current state can be exported for migration planning. |
| Postgres config detection | Pass | Deployment gate detects `DATABASE_URL` or `PGHOST`/`PGDATABASE`/`PGUSER`. |
| Runtime Postgres repository implementation | Block | The actual Postgres CRUD layer is not implemented yet. |
| RDS provisioning | Block | No AWS RDS database has been provisioned. |

## Next Step

Phase 9C-3 should implement one of the next production boundaries:

- Postgres repository implementation and migration importer, or
- S3 asset adapter if the team wants to handle media storage before transactional persistence.

The recommended next step is the Postgres repository implementation because it unlocks clean migration, audit, and Notion sync.
