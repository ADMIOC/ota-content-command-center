# OTA Social Account Launchpad Build Schema

## Purpose

The OTA Social Account Launchpad is the human-led account creation, claiming, verification, security, and connector-readiness module inside the larger OTA Social Account Center.

This module does not perform bulk programmatic signups. It gives Moe and the account build agents a controlled operational surface for deciding what to create, what to verify, what proof is required, and when each brand-platform account is ready for OTA Social Engine publishing workflows.

## Product Positioning

Name: OTA Social Account Launchpad

Parent surface: OTA Social Account Center

Primary user: Moe / Senior Brand Builder

Secondary users:
- OTA operators
- Brand owners
- Compliance reviewers
- Publishing operators
- Build agents maintaining the account center

Primary outcome:
- Every OTA brand has a verified, secured, owned, and connector-ready social account map across the top 7 platforms.

Non-goals:
- No automated account signup bots
- No CAPTCHA bypass
- No credential sharing in app state
- No public posting before approval
- No compliance-sensitive brand launch without approved positioning

## Supported Platforms

The top 7 platform set is fixed for Launchpad v1:

1. LinkedIn
2. Instagram
3. Facebook
4. X
5. TikTok
6. YouTube
7. Threads

## Core User Story

As Moe, I need to open one Account Center view, select a brand, see every required social account, know what already exists, know what must be created or claimed, follow the approved handle/bio/avatar instructions, upload proof of control, and mark the account ready for publishing connectors only after ownership, security, and compliance checks pass.

## Module Placement

Recommended navigation:

- Account Center
  - Portfolio Readiness
  - Brand Profiles
  - Account Launchpad
  - Verification Vault
  - Connector Readiness
  - Compliance Review
  - Activity Log

The Launchpad should default to the Portfolio Readiness matrix, then drill into brand and platform detail drawers.

## Readiness State Machine

Each brand-platform account moves through this state sequence:

```text
not_started
planned
handle_selected
needs_human_creation
created_unverified
claimed_unverified
admin_verified
security_verified
profile_completed
oauth_connected
publisher_connected
ready
blocked
retired
```

State definitions:

- `not_started`: No work has been done for this brand-platform account.
- `planned`: The platform is required and assigned but handle/profile choices are not final.
- `handle_selected`: Final handle convention has been approved.
- `needs_human_creation`: The next action is manual creation inside the official platform UI.
- `created_unverified`: Account was created, but admin ownership proof is missing.
- `claimed_unverified`: Existing account was found or claimed, but control is not verified.
- `admin_verified`: A responsible OTA admin has verified control.
- `security_verified`: Recovery email, 2FA, password vault reference, and owner are recorded.
- `profile_completed`: Bio, avatar, banner, links, category, and contact data are complete.
- `oauth_connected`: Platform authorization or account connection is complete where applicable.
- `publisher_connected`: Blotato, Restream, or downstream publisher can see the account.
- `ready`: Account is approved for OTA Social Engine publishing workflows.
- `blocked`: Work cannot proceed until a named blocker is resolved.
- `retired`: Account is no longer part of the active brand map.

Required state guards:

- `ready` requires `admin_verified`, `security_verified`, `profile_completed`, and either `publisher_connected` or an explicit `manual_publish_only` exception.
- Regulated brands require `compliance_approved_public_positioning` before `profile_completed`.
- No account can become `publisher_connected` without human approval.
- No credential can be stored directly in Launchpad records.

## Priority Buckets

Priority values:

```text
P0 = Launch critical
P1 = Near-term portfolio presence
P2 = Positioning-dependent or lower urgency
P3 = Public launch not yet confirmed
```

P0 work should appear first in default queues.

## Brand Seed Data

```json
[
  {
    "brandId": "urban-fusion-ai",
    "brandName": "Urban Fusion Ai",
    "domain": "UrbanFusion.ai",
    "priority": "P1",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Create or claim branded accounts after confirming final handle convention."
  },
  {
    "brandId": "capital-recovery-services",
    "brandName": "Capital Recovery Services",
    "domain": "crshcs.com",
    "priority": "P0",
    "existingAccountsFound": ["linkedin"],
    "requiredPlatforms": ["instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Verify LinkedIn admin access; create or claim remaining accounts; verify no legacy accounts controlled by CRS before launch.",
    "complianceProfile": "regulated_healthcare_recovery"
  },
  {
    "brandId": "trustbid",
    "brandName": "TrustBid",
    "domain": "TrustBid.App",
    "priority": "P1",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Confirm canonical domain, then create accounts."
  },
  {
    "brandId": "wyr-detail",
    "brandName": "WYR Detail",
    "domain": "WYRDetail.com",
    "priority": "P1",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Create or claim social accounts and connect booking/app links."
  },
  {
    "brandId": "dynamic-compliance-chain",
    "brandName": "Dynamic Compliance Chain",
    "domain": "dccengine.com",
    "priority": "P2",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Create accounts after confirming compliance-safe public positioning.",
    "complianceProfile": "regulated_compliance"
  },
  {
    "brandId": "flipless-app",
    "brandName": "FlipLess App",
    "domain": "FlipLess.App",
    "priority": "P0",
    "existingAccountsFound": ["instagram", "tiktok"],
    "requiredPlatforms": ["linkedin", "facebook", "youtube", "threads"],
    "verificationPlatforms": ["x"],
    "nextActionOwner": "Moe",
    "nextAction": "Verify credentials and control for linked accounts; create missing accounts; validate X URL."
  },
  {
    "brandId": "deal-flow-coach",
    "brandName": "Deal Flow Coach",
    "domain": "dealflow.coach",
    "priority": "P2",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Verify website, then create accounts."
  },
  {
    "brandId": "own-the-algo-podcast",
    "brandName": "Own The Algo Podcast",
    "domain": "podcast.ownthealgo.com",
    "priority": "P0",
    "existingAccountsFound": ["linkedin", "instagram", "x", "tiktok", "facebook", "youtube"],
    "requiredPlatforms": ["threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Verify credentials and control; create Threads if desired; connect Restream workflow."
  },
  {
    "brandId": "own-the-algorithm",
    "brandName": "Own The Algorithm",
    "domain": "ownthealgo.com",
    "priority": "P0",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Create or claim parent brand accounts first; this is the anchor identity for the portfolio."
  },
  {
    "brandId": "wyr-podcast",
    "brandName": "WYR Podcast",
    "domain": "podcast.wyrios.com",
    "priority": "P1",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Create podcast social accounts and connect Restream/podcast producer workflow."
  },
  {
    "brandId": "the-algo-academy",
    "brandName": "The Algo Academy",
    "domain": "thealgoacademy.com",
    "priority": "P2",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Create education-brand accounts with course/community positioning."
  },
  {
    "brandId": "ap2-academy",
    "brandName": "AP2 Academy",
    "domain": "ap2.academy",
    "priority": "P2",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Verify brand/domain first, then create accounts."
  },
  {
    "brandId": "ai-payment-cloud",
    "brandName": "Ai Payment Cloud",
    "domain": "aipayment.cloud",
    "priority": "P2",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Create accounts after confirming product messaging and compliance posture.",
    "complianceProfile": "regulated_payments"
  },
  {
    "brandId": "in-the-loop-os",
    "brandName": "In The Loop OS",
    "domain": "itlos.wyrdetail.com",
    "priority": "P3",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Confirm public launch status before creating public social presence."
  },
  {
    "brandId": "the-vfo",
    "brandName": "The VFO",
    "domain": "vfo.app",
    "priority": "P1",
    "existingAccountsFound": [],
    "requiredPlatforms": ["linkedin", "instagram", "facebook", "x", "tiktok", "youtube", "threads"],
    "nextActionOwner": "Moe",
    "nextAction": "Verify canonical domain and create accounts.",
    "complianceProfile": "regulated_finance"
  }
]
```

## Data Model

### BrandProfile

```ts
type BrandProfile = {
  id: string;
  name: string;
  domain: string;
  priority: "P0" | "P1" | "P2" | "P3";
  status: "active" | "paused" | "prelaunch" | "retired";
  owner: string;
  complianceProfile?: ComplianceProfile;
  canonicalHandle?: string;
  alternateHandles: string[];
  approvedBioShort?: string;
  approvedBioLong?: string;
  approvedLinkInBioUrl?: string;
  avatarAssetUrl?: string;
  bannerAssetUrl?: string;
  brandKitStatus: "missing" | "draft" | "approved";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

### PlatformAccount

```ts
type PlatformAccount = {
  id: string;
  brandId: string;
  platform: SocialPlatform;
  priority: "P0" | "P1" | "P2" | "P3";
  state: AccountReadinessState;
  desiredHandle: string;
  actualHandle?: string;
  profileUrl?: string;
  accountType?: "personal" | "business" | "creator" | "company_page" | "channel" | "page";
  creationMode: "create_new" | "claim_existing" | "verify_existing" | "not_required";
  humanCreationRequired: boolean;
  manualPublishOnly?: boolean;
  ownerUserId?: string;
  adminVerifiedAt?: string;
  securityVerifiedAt?: string;
  profileCompletedAt?: string;
  oauthConnectedAt?: string;
  publisherConnectedAt?: string;
  readyAt?: string;
  blockers: AccountBlocker[];
  evidenceIds: string[];
  connectorIds: string[];
  nextAction: string;
  nextActionOwner: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};
```

### ComplianceProfile

```ts
type ComplianceProfile =
  | "none"
  | "regulated_healthcare_recovery"
  | "regulated_compliance"
  | "regulated_payments"
  | "regulated_finance";
```

### SocialPlatform

```ts
type SocialPlatform =
  | "linkedin"
  | "instagram"
  | "facebook"
  | "x"
  | "tiktok"
  | "youtube"
  | "threads";
```

### AccountReadinessState

```ts
type AccountReadinessState =
  | "not_started"
  | "planned"
  | "handle_selected"
  | "needs_human_creation"
  | "created_unverified"
  | "claimed_unverified"
  | "admin_verified"
  | "security_verified"
  | "profile_completed"
  | "oauth_connected"
  | "publisher_connected"
  | "ready"
  | "blocked"
  | "retired";
```

### VerificationEvidence

```ts
type VerificationEvidence = {
  id: string;
  platformAccountId: string;
  evidenceType:
    | "admin_screenshot"
    | "profile_url"
    | "recovery_email_confirmed"
    | "two_factor_confirmed"
    | "password_vault_reference"
    | "business_manager_access"
    | "channel_manager_access"
    | "oauth_connection_proof"
    | "publisher_connection_proof"
    | "legacy_account_search"
    | "compliance_approval";
  title: string;
  description?: string;
  fileUrl?: string;
  externalUrl?: string;
  capturedBy: string;
  capturedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status: "pending_review" | "accepted" | "rejected";
};
```

### ConnectorStatus

```ts
type ConnectorStatus = {
  id: string;
  platformAccountId: string;
  connector:
    | "blotato"
    | "restream"
    | "linkedin_oauth"
    | "meta_oauth"
    | "google_oauth"
    | "tiktok_oauth"
    | "x_oauth"
    | "manual";
  status: "not_connected" | "pending_auth" | "connected" | "failed" | "revoked" | "not_supported";
  externalAccountId?: string;
  externalDisplayName?: string;
  externalUsername?: string;
  connectedBy?: string;
  connectedAt?: string;
  lastCheckedAt?: string;
  lastCheckDetail?: string;
};
```

### AccountBlocker

```ts
type AccountBlocker = {
  id: string;
  platformAccountId: string;
  severity: "low" | "medium" | "high" | "launch_blocking";
  reason:
    | "handle_unavailable"
    | "domain_not_verified"
    | "legacy_account_conflict"
    | "missing_admin_access"
    | "missing_recovery_email"
    | "missing_two_factor"
    | "missing_brand_assets"
    | "missing_compliance_approval"
    | "oauth_failed"
    | "publisher_not_connected"
    | "platform_policy_risk"
    | "other";
  detail: string;
  owner: string;
  status: "open" | "in_progress" | "resolved" | "waived";
  createdAt: string;
  resolvedAt?: string;
};
```

### ActivityEvent

```ts
type ActivityEvent = {
  id: string;
  actor: string;
  action:
    | "brand_created"
    | "brand_updated"
    | "handle_selected"
    | "creation_task_assigned"
    | "account_created"
    | "account_claimed"
    | "admin_verified"
    | "security_verified"
    | "profile_completed"
    | "evidence_uploaded"
    | "evidence_approved"
    | "compliance_approved"
    | "oauth_connected"
    | "publisher_connected"
    | "ready_approved"
    | "blocker_opened"
    | "blocker_resolved";
  brandId: string;
  platformAccountId?: string;
  inputRef?: string;
  outputRef?: string;
  approvalState?: "not_required" | "pending" | "approved" | "rejected";
  createdAt: string;
};
```

## UI Schema

### Portfolio Readiness Matrix

Purpose:
- Show all brands and all 7 platforms in one scan-friendly grid.

Rows:
- Brand
- Domain
- Priority
- Compliance badge
- LinkedIn
- Instagram
- Facebook
- X
- TikTok
- YouTube
- Threads
- Next action

Cell contents:
- Readiness state badge
- Platform icon
- Blocker count
- Connector status dot
- Click target for platform drawer

Default sort:
1. P0
2. P1
3. P2
4. P3
5. Brands with launch-blocking blockers
6. Brands with nearest due date

### Brand Detail Drawer

Sections:
- Brand identity
- Handle convention
- Approved bios and descriptions
- Visual assets
- Domain links
- Compliance posture
- Required platform map
- Open blockers
- Activity history

Primary actions:
- Approve handle convention
- Generate platform profile draft
- Assign creation tasks
- Request compliance review
- Export account creation packet

### Platform Account Drawer

Sections:
- Platform account status
- Desired handle and actual handle
- Official creation or claim instructions
- Profile copy
- Required evidence
- Security checklist
- Connector checklist
- Blockers
- Activity events

Primary actions:
- Mark handle selected
- Mark human creation needed
- Record created account
- Record claimed account
- Upload evidence
- Verify admin control
- Verify security
- Mark profile complete
- Start connector flow
- Mark ready

### Moe Task Queue

Purpose:
- Give Moe a daily action list.

Task card fields:
- Brand
- Platform
- Priority
- Current state
- Next action
- Required evidence
- Compliance warning if applicable
- Due date
- Owner

Filters:
- P0 only
- Needs creation
- Needs verification
- Needs security
- Needs compliance
- Needs connector
- Blocked

## Platform Checklist Templates

### LinkedIn

Required checks:
- Company/Page exists or must be created manually
- Admin role confirmed
- Public URL recorded
- Logo and banner added
- About section completed
- Website/domain added
- Compliance-safe description approved if regulated
- OAuth or publisher connector checked if supported

### Instagram

Required checks:
- Account exists or must be created manually
- Business or creator status confirmed if needed
- Meta account ownership understood
- Profile image, bio, category, and link added
- 2FA confirmed
- Connected to Meta/Blotato if publishing workflow requires it

### Facebook

Required checks:
- Page exists or must be created manually
- Business/admin access verified
- Page URL recorded
- Profile, cover, category, about, website, and CTA completed
- 2FA confirmed for admins
- Meta/Blotato connector checked if publishing workflow requires it

### X

Required checks:
- Account exists or must be created manually
- Handle and profile URL recorded
- 2FA confirmed
- Bio and website completed
- Platform policy risk reviewed for automation-sensitive brands
- X connector checked only after human-approved authorization

### TikTok

Required checks:
- Account exists or must be created manually
- Business/creator mode confirmed if needed
- Bio, profile image, and link settings completed
- 2FA confirmed
- TikTok/Blotato connector checked if publishing workflow requires it

### YouTube

Required checks:
- Channel exists or must be created manually
- Channel manager/admin access verified
- Handle, channel URL, description, links, avatar, and banner completed
- Brand account ownership confirmed where applicable
- Google/Blotato/Restream connector checked if publishing or live workflow requires it

### Threads

Required checks:
- Threads profile exists or must be created manually
- Relationship to Instagram/Meta identity recorded if applicable
- Bio and profile URL recorded
- 2FA confirmed through associated account
- Threads/Meta/Blotato connector checked if publishing workflow requires it

## API Contracts

### List Portfolio Readiness

```http
GET /api/account-center/readiness
```

Response:

```ts
type ReadinessResponse = {
  brands: BrandProfile[];
  accounts: PlatformAccount[];
  connectors: ConnectorStatus[];
  blockers: AccountBlocker[];
  checkedAt: string;
};
```

### Update Brand Profile

```http
PATCH /api/account-center/brands/:brandId
```

Request:

```ts
type UpdateBrandProfileRequest = Partial<
  Pick<
    BrandProfile,
    | "canonicalHandle"
    | "alternateHandles"
    | "approvedBioShort"
    | "approvedBioLong"
    | "approvedLinkInBioUrl"
    | "avatarAssetUrl"
    | "bannerAssetUrl"
    | "brandKitStatus"
    | "notes"
  >
>;
```

### Update Platform Account

```http
PATCH /api/account-center/accounts/:platformAccountId
```

Request:

```ts
type UpdatePlatformAccountRequest = Partial<
  Pick<
    PlatformAccount,
    | "state"
    | "desiredHandle"
    | "actualHandle"
    | "profileUrl"
    | "accountType"
    | "creationMode"
    | "ownerUserId"
    | "nextAction"
    | "nextActionOwner"
    | "dueDate"
    | "manualPublishOnly"
  >
>;
```

### Upload Verification Evidence

```http
POST /api/account-center/accounts/:platformAccountId/evidence
```

Request:

```ts
type CreateEvidenceRequest = Pick<
  VerificationEvidence,
  "evidenceType" | "title" | "description" | "fileUrl" | "externalUrl" | "capturedBy"
>;
```

### Review Verification Evidence

```http
PATCH /api/account-center/evidence/:evidenceId/review
```

Request:

```ts
type ReviewEvidenceRequest = {
  status: "accepted" | "rejected";
  reviewedBy: string;
  reviewNote?: string;
};
```

### Check Publisher Accounts

```http
GET /api/account-center/connectors/blotato/accounts
```

Implementation note:
- This can wrap the existing server-side Blotato account lookup.
- Store only sanitized account metadata: account id, platform, display name, username, and checked time.
- Do not expose API keys to the client.

### Mark Account Ready

```http
POST /api/account-center/accounts/:platformAccountId/mark-ready
```

Request:

```ts
type MarkReadyRequest = {
  approvedBy: string;
  approvalNote?: string;
};
```

Server validation:
- Admin evidence accepted
- Security evidence accepted
- Profile complete
- Compliance approval accepted when required
- Connector connected or manual-publish exception approved
- No open launch-blocking blockers

## Approval Gates

Always required:
- Human approval before credential changes
- Human approval before OAuth or publisher connection
- Human approval before marking account ready
- Human approval before public posting

Regulated brand gates:
- CRS: healthcare/recovery positioning approval before public profile completion
- DCC: compliance-safe positioning approval before public launch
- Ai Payment Cloud: product and payments compliance posture approval before public launch
- The VFO: finance/investment/legal/tax positioning approval before public launch

## Agent Responsibilities

### Account Launch Agent

Owns:
- Creating task packets for Moe
- Assigning platform account tasks
- Detecting missing required accounts
- Updating readiness state after human-submitted evidence

Does not own:
- Creating accounts automatically
- Storing credentials
- Publishing content

### Brand Profile Agent

Owns:
- Drafting bios
- Suggesting handle conventions
- Preparing avatar/banner requirements
- Maintaining brand copy consistency

### Verification Agent

Owns:
- Reviewing submitted evidence
- Flagging missing proof
- Opening blockers
- Confirming control and security status

### Compliance Agent

Owns:
- Reviewing regulated-brand public profile copy
- Approving or rejecting bio/about text
- Blocking public launch where claims are unsafe

### Connector Agent

Owns:
- Checking whether Blotato, Restream, or platform OAuth can see a verified account
- Recording sanitized connector metadata
- Opening connector blockers

## Build Phases

### Phase 1: Static Schema and Seeded Readiness Matrix

Deliver:
- Account Center route or tab
- Portfolio Readiness matrix
- Seed data from this document
- Brand/platform detail drawers
- State badges and priority filters
- No credential or OAuth work yet

### Phase 2: Task and Evidence Workflow

Deliver:
- Moe task queue
- Evidence upload/reference records
- Admin/security/profile completion checklists
- Blocker creation and resolution
- Activity log events

### Phase 3: Connector Readiness

Deliver:
- Blotato account lookup integration
- Restream readiness slot for live workflow brands
- Connector status mapping to platform accounts
- Human approval before connector status promotes account readiness

### Phase 4: Compliance Gates

Deliver:
- Compliance profile handling
- Profile copy review flow
- Regulated-brand blocker automation
- Readiness validation that respects compliance approvals

### Phase 5: Operational Polish

Deliver:
- Exportable account creation packets
- Daily P0/P1 action queue
- Portfolio progress metrics
- Search and filters
- Audit-friendly history

## Metrics

Portfolio metrics:
- Total required accounts
- Accounts ready
- Accounts blocked
- Accounts needing creation
- Accounts needing verification
- Accounts needing connector
- P0 readiness percentage
- Regulated-brand approval percentage

Brand metrics:
- Platform coverage
- Ready platforms
- Missing platforms
- Open launch blockers
- Oldest unresolved blocker

Operator metrics:
- Moe tasks open
- Moe tasks completed this week
- Evidence awaiting review
- Connector checks failing

## Success Criteria

Launchpad v1 is successful when:

- The P0 portfolio can be reviewed in under 60 seconds.
- Moe can see the next required action for every brand-platform account.
- Every ready account has admin, security, profile, and connector evidence.
- Regulated brands cannot accidentally become ready without compliance approval.
- OTA Social Engine publishing workflows can trust the Account Center as the source of truth.
