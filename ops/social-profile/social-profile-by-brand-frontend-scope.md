# Social Profile by Brand Frontend Scope

## Purpose

Build a frontend and operating database for brand-specific social profile readiness, so OTAP can assemble, validate, and store the public profile elements required before a platform account is connected to publishing or broadcast infrastructure.

This scope extends the OTAP Social Account Launchpad Loop. It does not create accounts automatically, bypass platform verification, or turn on live publishing without human approval.

## Primary Outcome

The system should let an operator select a brand, choose target social platforms, complete each platform's profile fields, capture ownership and security evidence, and then prepare eligible streaming destinations for Restream manual channel configuration.

## Operating Boundary

| Included | Excluded |
|---|---|
| Brand-level social profile database | Bulk programmatic account signup |
| Platform-specific profile field builder | CAPTCHA bypass or account recovery automation |
| Readiness state tracking | Password or MFA secret storage |
| Evidence capture and approval gates | Direct live posting without approval |
| Restream manual channel add preparation | Automatic write-scope activation |
| Channel creation after explicit approval | Unverified OAuth or platform API assumptions |

## Frontend Product Shape

### Main Navigation

| View | Purpose |
|---|---|
| Brand Profiles | Select brand, status, owner, and target platforms. |
| Platform Builder | Build platform-specific handle, bio, links, assets, and profile requirements. |
| Readiness Matrix | Track ownership, security, profile, connector, and publishing readiness per platform. |
| Evidence Vault | Store non-secret proof such as account URL, owner, screenshots, admin notes, and connector evidence. |
| Restream Channels | Prepare and approve manually configured Restream channel payloads. |
| Audit Log | Show profile changes, approvals, connector actions, and blockers. |

### Core Workflow

1. Operator creates or selects a brand.
2. Operator chooses target platforms from the platform catalog.
3. Frontend renders required and recommended fields for each platform.
4. Operator enters public profile content and non-secret operational evidence.
5. System computes readiness state and blocks connector work until ownership, security, and profile evidence are complete.
6. For streaming-capable destinations, system prepares the Restream manual channel payload.
7. Human approver confirms the channel creation action.
8. Backend calls Restream only after approval and records the response or failure.

## Social Profile by Brand Database

### Brand

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key. |
| `name` | Text | Public brand name. |
| `slug` | Text | Stable internal identifier. |
| `domain` | URL | Primary brand domain. |
| `owner_user_id` | UUID | Accountable brand owner. |
| `brand_category` | Enum | Example: podcast, SaaS, healthcare, holding company, creator brand. |
| `status` | Enum | draft, active, paused, archived. |
| `approval_policy_id` | UUID | Links to brand approval rules. |
| `created_at` | Timestamp | System generated. |
| `updated_at` | Timestamp | System generated. |

### Social Profile

One row per brand and platform.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key. |
| `brand_id` | UUID | Parent brand. |
| `platform_key` | Enum | Platform catalog key. |
| `target_handle` | Text | Desired handle. |
| `actual_handle` | Text | Confirmed handle. |
| `profile_url` | URL | Public account or channel URL. |
| `display_name` | Text | Public display name. |
| `bio` | Text | Platform-specific public bio. |
| `website_url` | URL | Public link. |
| `profile_image_asset_id` | UUID | Avatar or logo asset. |
| `banner_asset_id` | UUID | Header or channel art asset. |
| `business_account_status` | Enum | unknown, not_required, required_missing, pending, verified. |
| `ownership_state` | Enum | target_identified, human_action_required, ownership_claimed. |
| `security_state` | Enum | unknown, incomplete, verified. |
| `profile_state` | Enum | incomplete, needs_review, ready. |
| `connector_state` | Enum | none, candidate, connected, blocked. |
| `publishing_state` | Enum | none, draft_ready, live_ready, deferred, blocked. |
| `restream_channel_id` | Text | Set only after successful Restream creation or sync. |
| `restream_platform_id` | Number | Restream manual platform ID where supported. |
| `notes` | Text | Human-readable operator notes. |
| `created_at` | Timestamp | System generated. |
| `updated_at` | Timestamp | System generated. |

### Platform Profile Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key. |
| `social_profile_id` | UUID | Parent profile. |
| `field_key` | Text | Example: `category`, `contact_email`, `short_description`. |
| `field_value` | Text or JSON | Flexible platform-specific value. |
| `required_for_profile_ready` | Boolean | Drives readiness calculation. |
| `updated_at` | Timestamp | System generated. |

### Evidence Record

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key. |
| `social_profile_id` | UUID | Parent profile. |
| `evidence_type` | Enum | ownership, security, profile, connector, approval, restream. |
| `title` | Text | Short label. |
| `description` | Text | Non-secret evidence summary. |
| `asset_id` | UUID | Optional screenshot or file. |
| `evidence_url` | URL | Optional non-secret URL. |
| `recorded_by_user_id` | UUID | Operator. |
| `status` | Enum | pending, accepted, rejected, superseded. |
| `created_at` | Timestamp | System generated. |

### Restream Channel Candidate

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key. |
| `social_profile_id` | UUID | Parent profile. |
| `platform_id` | Number | Restream platform ID. |
| `display_name` | Text | Restream channel display name. |
| `stream_url_secret_ref` | Text | Secret manager reference, not plaintext. |
| `stream_key_secret_ref` | Text | Secret manager reference, not plaintext. |
| `rtmp_username_secret_ref` | Text | Custom RTMP only. |
| `rtmp_password_secret_ref` | Text | Custom RTMP only. |
| `instagram_username` | Text | Instagram only, non-secret. |
| `approval_state` | Enum | draft, needs_approval, approved, rejected, submitted, connected, failed. |
| `restream_channel_id` | Text | Restream response channel ID. |
| `last_error_code` | Text | Example: `channel_invalid_url`. |
| `last_error_message` | Text | Sanitized error summary. |
| `created_at` | Timestamp | System generated. |
| `updated_at` | Timestamp | System generated. |

## Popular Platform Scope

### Phase 1 Profile Builder Platforms

These platforms should be in the first frontend catalog because they cover the most common brand, creator, short-form, long-form, and professional surfaces.

| Platform | Profile Builder Priority | Restream Manual Channel Path | Key Readiness Notes |
|---|---:|---|---|
| YouTube | P0 | Usually managed through Restream connected channel or custom/manual stream details when supplied. | Channel ownership, brand handle, channel art, verification, live-stream eligibility. |
| Instagram | P0 | Restream supports manual Instagram destination with platform ID `73` and `streamKey`; `instagramUsername` is optional. | Professional account, Meta ownership, profile link, live access, brand consistency. |
| Facebook Page | P0 | Use Restream connected channel where possible; Facebook Group manual path is platform ID `37` with `streamKey`. | Page admin proof, Business Manager, role, profile and cover assets. |
| LinkedIn | P0 | Usually connector-driven, not covered by the documented manual add table. | Company page admin proof, description, website, logo, compliance approval. |
| TikTok | P0 | Treat as connector/manual-readiness until a verified Restream or platform-specific channel path is confirmed. | Business or creator account status, live access, profile link, age or follower constraints if applicable. |
| X / Twitter | P1 | Treat as profile/readiness only unless an approved streaming destination is confirmed. | Handle ownership, profile consistency, paid/API considerations if posting later. |
| Threads | P1 | Profile/readiness only in first pass. | Instagram linkage, Meta status, account URL, manual posting fallback. |
| Twitch | P1 | Custom RTMP can be used where stream URL and key are available; use platform-specific connection if Restream supports it in account UI. | Channel URL, stream key source, mature content settings, moderation owner. |
| Kick | P1 | Custom RTMP if supported by destination stream URL and key. | Creator dashboard access, stream key source, brand category. |
| Discord Stage / Community | P2 | Not a standard Restream manual channel in the documented table. | Community ownership and event promotion readiness. |
| Reddit | P2 | Profile/readiness only unless manual RTMP path is verified for the use case. | Subreddit/account authority, moderation constraints, link policy. |
| Pinterest | P2 | Profile/readiness only. | Business profile, claim domain, visual asset readiness. |
| Snapchat | P2 | Profile/readiness only. | Public profile, creator/business setup, manual publishing path. |

### Restream Documented Manual Add Platforms

The current Restream add-channel docs identify these manual channel options:

| Restream Platform | ID | Required Fields |
|---|---:|---|
| Custom RTMP | 29 | `streamUrl`; `streamKey` optional; RTMP username and password optional. |
| Facebook Group | 37 | `streamKey`. |
| Steam | 49 | `streamUrl`, `streamKey`. |
| Nimo | 60 | `streamUrl`, `streamKey`. |
| Naver | 61 | `streamUrl`, `streamKey`. |
| Mixcloud | 68 | `streamKey`. |
| Telegram | 72 | `streamUrl`, `streamKey`. |
| Instagram | 73 | `streamKey`; optional `instagramUsername`; `displayName` ignored. |
| Amazon Live | 74 | `streamUrl`, `streamKey`. |
| Custom SRT | 78 | `streamUrl`. |
| Substack | 79 | `streamKey`. |
| Mux | 80 | `streamKey`. |
| Custom WHIP | 81 | `streamUrl`. |
| Custom HLS | 82 | `streamUrl`. |

Source: Restream Channels API, Add Channel: `https://developers.restream.io/channels/channel-add`.

## Restream Integration Contract

### Required Scope

Restream channel creation requires `channels.write`. Keep this scope disabled until the operator approves channel management for the selected brand.

### Endpoint

```http
POST https://api.restream.io/v2/user/channels
Authorization: Bearer <RESTREAM_ACCESS_TOKEN>
Content-Type: application/json
```

### Request Body

```json
{
  "platformId": 29,
  "streamUrl": "rtmp://example.com/live",
  "streamKey": "secret-reference-resolved-server-side",
  "displayName": "Own The Algo - Custom RTMP"
}
```

Never store or render plaintext stream keys in the frontend after initial entry. The UI should send secrets to the backend, the backend should write them to the secret store, and the database should keep only secret references.

### Success Response To Store

```json
{
  "id": 123456,
  "platformId": 29,
  "channelUrl": "https://example.com/live",
  "displayName": "My Custom RTMP"
}
```

### Error States To Map

| Restream Error | Frontend State | Operator Action |
|---|---|---|
| `channel_invalid_stream_key` | failed | Re-enter or rotate stream key. |
| `channel_invalid_url` | failed | Confirm stream URL format and destination requirements. |
| `invalid_token` | blocked | Re-authenticate Restream OAuth or refresh token. |
| Missing `channels.write` | blocked | Request explicit approval to enable channel write scope. |

## Readiness Gates

| Gate | Required Before |
|---|---|
| Brand owner assigned | Any platform profile can be approved. |
| Account URL or target handle recorded | Platform can leave `target_identified`. |
| Ownership proof accepted | Security review can begin. |
| MFA and recovery owner recorded | Profile can become connector candidate. |
| Public profile fields complete | Restream candidate can be drafted. |
| Stream URL or key secret stored | Restream approval can be requested. |
| Human approval logged | Restream add-channel request can be sent. |

## API Surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/brands` | List brands and profile completion summary. |
| `POST` | `/api/brands` | Create brand shell. |
| `GET` | `/api/brands/:brandId/social-profiles` | List brand platform profiles. |
| `POST` | `/api/brands/:brandId/social-profiles` | Add platform profile. |
| `PATCH` | `/api/social-profiles/:profileId` | Update common social profile fields. |
| `PUT` | `/api/social-profiles/:profileId/fields` | Upsert platform-specific fields. |
| `POST` | `/api/social-profiles/:profileId/evidence` | Add evidence record. |
| `POST` | `/api/social-profiles/:profileId/restream-candidates` | Create Restream channel candidate. |
| `POST` | `/api/restream-candidates/:candidateId/approve` | Log human approval. |
| `POST` | `/api/restream-candidates/:candidateId/submit` | Server-side Restream add-channel call. |
| `GET` | `/api/audit-log?brandId=` | Review changes and connector actions. |

## Frontend Components

| Component | Responsibilities |
|---|---|
| Brand selector | Switch brand context and prevent cross-brand edits. |
| Platform catalog grid | Show recommended platforms, priority, current readiness, and missing evidence. |
| Profile field form | Render common fields plus platform-specific fields. |
| Asset picker | Attach avatar, banner, screenshots, and evidence files. |
| Readiness badge group | Show ownership, security, profile, connector, and publishing state. |
| Evidence drawer | Add and review proof without exposing secrets. |
| Secret capture modal | Capture stream URL/key or RTMP credentials, then clear plaintext from client state. |
| Restream candidate preview | Show payload summary with secrets redacted. |
| Approval modal | Require operator approval before write action. |
| Audit timeline | Show edits, approvals, submissions, responses, and blockers. |

## Build Phases

| Phase | Scope | Done When |
|---|---|---|
| 1 | Static schema and UI prototype | Brand selector, platform catalog, profile forms, readiness matrix, and local mock data exist. |
| 2 | Database-backed social profiles | Brand, profile, field, evidence, and audit objects persist. |
| 3 | Readiness engine | Profile state updates deterministically from required fields and accepted evidence. |
| 4 | Restream candidate drafting | Eligible profiles can create redacted Restream channel candidates. |
| 5 | Restream write integration | Approved candidates can call `POST /v2/user/channels` server-side with `channels.write`. |
| 6 | Connector reconciliation | Existing Restream channels can be listed and linked back to Social Profile records. |

## Success Criteria

- Operator can build profile records for at least OTAP, CRS, WYR, FlipLess, TheVFO, and Own The Algo without mixing brand data.
- Each target platform has clear required fields, optional fields, evidence requirements, and readiness state.
- Restream channel creation is impossible unless the profile is connector-ready and a human approval record exists.
- Stream keys and RTMP credentials are never stored in plaintext database fields or visible in audit logs.
- Restream responses and errors are recorded against the correct brand and social profile.
- The system can distinguish profile readiness from connector readiness and live publishing readiness.

## Immediate Build Recommendation

Start with the OTAP brand and these first platform records:

| Platform | Initial State | Reason |
|---|---|---|
| YouTube | Human Action Required | Most important long-form and live archive surface. |
| Instagram | Human Action Required | Restream manual path is explicitly documented. |
| Facebook Page or Group | Human Action Required | Common live distribution surface; group manual path is documented. |
| LinkedIn | Human Action Required | Important professional brand surface, but manual Restream add path is not confirmed in the current docs. |
| TikTok | Human Action Required | Popular short-form surface; live and connector constraints must be verified. |
| Custom RTMP | Connector Candidate once stream details exist | Useful fallback for destinations that provide RTMP details. |

Do not promote any profile beyond `Human Action Required` until ownership and security evidence are captured.
