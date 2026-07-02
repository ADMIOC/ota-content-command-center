# Social Account Command Center Notion Buildout

## Status

Created on 2026-06-30.

Phase 1 control-plane hardening completed on 2026-06-30.

Notion hub:
https://app.notion.com/p/38fa90a45ed78194ad95d43d43d39d4f

## Purpose

This Notion setup is the structured control plane for building and governing social accounts by brand. It moves the Social Profile by Brand workflow beyond the local HTML MVP and into a shared operating database.

## Databases

| Database | Use | URL |
|---|---|---|
| Social Brands | Brand-level ownership, domain, category, and status. | https://app.notion.com/p/1dc7bc0523a14a54ab99d2030edd1908 |
| Social Profiles by Brand | One row per brand/platform account. | https://app.notion.com/p/8a88b19b602c475f80ce09247c347567 |
| Social Media Assets | Asset metadata, dimensions, usage context, and approval state. | https://app.notion.com/p/d311627535294a3b9f4e64d0f516fc14 |
| Social Evidence Vault | Non-secret ownership, security, profile, connector, and approval proof. | https://app.notion.com/p/f74c03cd57ac4a779c52466bb052d238 |
| Restream Channel Candidates | Manual Restream channel candidates and secret-reference fields. | https://app.notion.com/p/a316afdaa7a74cefb49fee15a3493322 |
| Social Audit Events | Durable event trail for profile changes, evidence, media, approvals, connector actions, sync operations, and Restream submissions. | https://app.notion.com/p/837caf54c9cd48119696d06066a5c637 |

## Phase 1 Production Fields

Phase 1 added the operating fields needed for app/backend sync, approval workflows, blocking, and readiness gates.

| Field Group | Fields |
|---|---|
| Sync | `External ID`, `Source System`, `Last Synced At`, `Sync Status` |
| Workflow | `Next Action`, `Blocked Reason` |
| Approval | `Approved By`, `Approved At`, `Accepted By`, `Accepted At`, `Submitted At` |
| Readiness | `Ready For Connector`, `Ready For Publishing`, `Ready For Submit` |
| Relations | `Brand Record`, `Profile Record`, `Audit Events` |

## Phase 1 Operating Views

| View | Database |
|---|---|
| Phase 1 - Brand Status | Social Brands |
| Phase 1 - Active Brands | Social Brands |
| Phase 1 - P0 Working Table | Social Profiles by Brand |
| Phase 1 - Readiness Board | Social Profiles by Brand |
| Phase 1 - Blocked Profiles | Social Profiles by Brand |
| Phase 1 - Brand Launch Dashboard | Social Profiles by Brand |
| Phase 1 - Assets Needing Review | Social Media Assets |
| Phase 1 - Evidence Queue | Social Evidence Vault |
| Phase 1 - Restream Approval Queue | Restream Channel Candidates |
| Phase 1 - Recent Audit Events | Social Audit Events |

## Status Definitions

| Status | Meaning |
|---|---|
| Ownership Claimed | Account/channel access has been proven with non-secret evidence. |
| Security Verified | MFA, recovery owner, and credential custody have been proven. |
| Profile Ready | Required public profile fields and approved required assets are complete. |
| Connector Candidate | Connector work can begin, but external writes still require approval. |
| Connected | The external destination was created or independently verified. |

## Seeded Brands

| Brand | Slug | Initial Role |
|---|---|---|
| Own The Algo Podcast | otap | First proving ground for the workflow. |
| CRS Healthcare Solutions | crshcs | Healthcare-adjacent brand with stricter approval boundary. |
| WYR Detail | wyr | Auto-services brand account buildout. |
| The VFO | thevfo | Education/professional authority account buildout. |

## Seeded Rows

| Area | Count |
|---|---:|
| Brands | 4 |
| Social profile rows | 24 |
| Restream candidates | 8 |
| Audit event rows | 1 |

## Initial Platform Coverage

Each of the first four brands was seeded with:

| Platform | Purpose |
|---|---|
| YouTube | Long-form, live archive, and authority surface. |
| Instagram | Visual/social profile surface and documented Restream manual candidate path. |
| Facebook Page | Common brand page surface and Meta account readiness path. |
| LinkedIn | Professional authority surface. |
| TikTok | Short-form account readiness surface. |
| Custom RTMP | Technical fallback destination for approved live/event workflows. |

## Operator Workflow

1. Open the Notion hub.
2. Use `Social Profiles by Brand` and start from the `P0 Working Table` or `Readiness Board`.
3. Choose one brand and one platform.
4. Fill actual handle, profile URL, display name, bio, website URL, and business account status.
5. Add asset metadata in `Social Media Assets`, including dimensions in the dimensions description.
6. Add non-secret proof in `Social Evidence Vault`.
7. Move Restream candidates beyond `Draft` only after ownership, security, profile, and approval evidence are accepted.

## Guardrails

- Do not store stream keys, RTMP credentials, account passwords, MFA backup codes, or OAuth tokens in Notion.
- Store only secret references for Restream channel candidates.
- Use external storage for actual media files when assets move beyond MVP testing.
- CRS requires no-PHI, no patient-specific examples, and final human approval before publishing or streaming.

## Verification Notes

The Notion creation tools returned successful page/database creation results for the hub, six databases, four brand records, twenty-four social profile records, eight Restream candidate records, and the Phase 1 completion audit event.

The Notion schema update tools returned successful production-field additions for Social Brands, Social Profiles by Brand, Social Media Assets, Social Evidence Vault, and Restream Channel Candidates. The Social Audit Events database was created under the hub and linked to Social Profiles by Brand through relation properties.

The Notion SQL query verification tool was unavailable because the current workspace plan requires Business or higher with Notion AI for `query_data_sources`. Counts above are based on successful create responses.
