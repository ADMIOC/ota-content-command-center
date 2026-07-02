# OTA Social Engine Phase 8 Governance And Permissions

## Status

Phase 8 is active in the local OTA Social Engine app.

The platform now has a local governance layer for role selection, permission visibility, role-gated controls, server-side permission checks, brand policy boundaries, and audit events for role changes and governed writes.

## Why This Phase Matters

The OTA Social Engine is moving from a single-operator build tool into a multi-brand operating platform. That means the system must show who is allowed to edit profiles, record assets, record evidence, store credentials, approve connector candidates, and submit connector work.

The goal is not heavy enterprise bureaucracy. The goal is clean operating order:

- No cross-brand leakage.
- No accidental Restream submission.
- No casual credential handling.
- No profile approval without evidence.
- No healthcare brand work that drifts into PHI or patient data.

## Active Roles

| Role | Intended Use |
| --- | --- |
| Super Admin | Full local platform operator. Can edit profiles, record assets, record evidence, store secrets, approve connectors, and submit connectors. |
| Brand Owner | Business-side owner for a brand. Can edit profile fields, record assets and evidence, and approve connector candidates. |
| Operator | Default working role. Can edit profile fields, record assets, and record evidence. Cannot store secrets, approve connectors, or submit to Restream. |
| Asset Reviewer | Media and proof reviewer. Can record assets and evidence without profile-edit or credential authority. |
| Connector Approver | Connector/security operator. Can record evidence, store secrets, approve connector candidates, and submit connectors. |
| Read-Only Reviewer | Review-only role. Can view the platform but cannot perform write actions. |

## Permission Model

| Permission | Controls |
| --- | --- |
| `edit_profile` | Profile field edits and profile save. |
| `record_asset` | Platform scan, asset metadata recording, and asset upload controls. |
| `record_evidence` | Evidence metadata and proof-file upload controls. |
| `store_secret` | Credential Vault, OAuth grant start, and OAuth refresh controls. |
| `approve_connector` | Restream candidate approval and connected-channel validation. |
| `submit_connector` | Submit-to-Restream action. |
| `view_assigned_brand` | Brand/profile read access. |
| `view_all_brands` | Cross-brand administrative read access. |

## Brand Boundaries

| Brand | Boundary |
| --- | --- |
| Own The Algo Podcast | Public media and social profile operations. |
| CRS Healthcare Solutions | Public-safe healthcare operations only. No PHI, no patient data, stricter approval required. |
| WYR Detail | Local service brand profile and media readiness. |
| The VFO | Professional authority profile and media readiness. |

## Approval Rules

1. Profile ready requires internal account confirmation, profile review, required assets, and owner approval.
2. Security verified requires MFA or recovery proof.
3. Restream approval requires connector proof and secret references.
4. CRS work must remain public-safe and no-PHI.

## What Changed In The App

| Surface | Change |
| --- | --- |
| Top bar | Added Active Role selector. |
| Step 1 | Save Profile is disabled when the active role lacks `edit_profile`. |
| Step 2 | Scan Platform Assets, Add Metadata, and upload controls are disabled when the active role lacks `record_asset`. |
| Step 3 | Add Evidence and upload controls are disabled when the active role lacks `record_evidence`. |
| Step 4 | Credential Vault and OAuth actions require `store_secret`; approval and validation require `approve_connector`; submission requires `submit_connector`. |
| Status column | Added Governance panel with active role, brand boundary, permissions, and approval rules. |
| Backend | Added server-side permission checks so disabled frontend controls are not the only protection. |
| Audit | Active role changes and governed connector actions write audit events. |

## Verification

| Check | Result |
| --- | --- |
| App build | Passed with `npm run build`. |
| Server syntax | Passed with `node --check server/local.mjs`. |
| Health endpoint | Returned `phase: 8`. |
| Role switch | `PATCH /api/governance/active-role` accepted `read_only_reviewer` and `operator`. |
| Denied write | Read-only role received `403` when attempting to edit a profile. |

## Remaining Governance Work

This phase is local-app governance. Before the platform is official in production, the next layer should add real authentication, persistent user identities, Notion permission mapping, and production audit retention.
