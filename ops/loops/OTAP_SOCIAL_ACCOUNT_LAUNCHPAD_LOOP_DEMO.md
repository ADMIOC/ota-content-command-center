# OTAP Social Account Launchpad Loop Demo

## Purpose

Demonstrate how OTAP should use bounded agent loops before applying the same pattern to CRS brand operations.

This loop does not create accounts automatically. It organizes human-led account creation, claiming, verification, security review, connector readiness, and publishing handoff evidence so the Social Engine can know which brand accounts are actually ready to use.

## Use When

- A new OTAP brand, project, or campaign needs social accounts prepared.
- An existing account may be claimed but not verified, secured, or connected.
- A publishing pipeline needs to know whether Blotato, Restream, or another aggregator can safely receive draft, scheduled, or broadcast content.
- CRS needs a lower-risk demonstration before its brand accounts are added to the same readiness model.

## Do Not Use For

- Bulk programmatic signups.
- CAPTCHA bypass, browser farms, or shared-credential workflows.
- Posting live content without explicit human approval.
- Treating connector availability as proof that the account is owned, secure, or brand-ready.

## Loop Prompt

Run the OTAP Social Account Launchpad Loop for `[brand or campaign]` across `[platform list]`.

For each platform, inspect the supplied account evidence, current ownership status, verification state, security posture, profile completeness, brand consistency, connector status, and publishing readiness. Record gaps, assign the next human action, and update the readiness state.

After each pass, only advance an account if the evidence proves the next state. If evidence is missing, mark the exact missing proof and stop that account at the current state. Do not create accounts, change passwords, connect production publishing tools, or post content unless explicitly approved in the current task.

Stop when every platform is either `Ready for Draft Publishing`, `Ready for Live Publishing`, `Blocked`, or `Deferred`.

Return the readiness matrix, evidence log, blockers, human actions, connector actions, and recommended next loop.

## Readiness State Machine

| State | Meaning | Required Evidence To Enter |
|---|---|---|
| `Target Identified` | Platform account is needed for the brand or campaign. | Platform is in campaign scope and has an owner. |
| `Human Action Required` | A person must create, claim, recover, or verify the account. | Missing ownership, access, verification, or policy setup is documented. |
| `Ownership Claimed` | OTAP controls or has authorized access to the account. | Account URL, authorized owner, access path, and recovery method are recorded. |
| `Security Verified` | Account has acceptable protection for connector work. | MFA, recovery email or phone, admin owner, and password-manager entry are confirmed. |
| `Brand Profile Ready` | Public profile can represent the brand. | Handle, display name, avatar, bio, URL, and brand notes pass review. |
| `Connector Candidate` | Account is ready to evaluate with Blotato or another publishing tool. | Ownership, security, and profile evidence are complete. |
| `Connector Connected` | Tool connection exists and was checked safely. | Non-destructive read or draft-capable connection proof is recorded. |
| `Ready for Draft Publishing` | Agent can prepare draft content for human review. | Connector supports draft/schedule package creation or manual draft handoff. |
| `Ready for Live Publishing` | Live posting is allowed for approved content. | Human approval policy, brand gate, and rollback/escalation path are recorded. |
| `Blocked` | Work cannot advance without an external decision or credential. | Blocker owner and required action are explicit. |
| `Deferred` | Platform is intentionally out of scope for now. | Reason and revisit condition are recorded. |

## Demo Input

Campaign: `OTAP Social Engine pilot`

Brand account set:

| Platform | Target Handle | Current Assumption | Owner |
|---|---|---|---|
| LinkedIn | `Own The Algo` company page | Exists, ownership not yet proven in this loop. | Human operator |
| X/Twitter | `@OwnTheAlgo` | Target identified, API path likely constrained. | Human operator |
| Instagram | `@ownthealgo` | Needs Business Manager readiness check. | Human operator |
| TikTok | `@ownthealgo` | Business account requirement likely applies. | Human operator |
| YouTube | `Own The Algo` | Channel readiness unknown. | Human operator |
| Threads | `@ownthealgo` | API maturity and account linkage need verification. | Human operator |

Known OTAP Social Engine context:

- Content extraction and ideation are operational.
- Operator review and copy generation are still manual or not fully built.
- Platform posting APIs are a critical gap.
- Blotato, Restream, or another aggregator may become the publishing or broadcast handoff layer, but account readiness must be proven first.

## Demo Pass 1 Output

| Platform | Current State | Evidence | Gap | Next Action | Gate |
|---|---|---|---|---|---|
| LinkedIn | `Human Action Required` | Platform is in scope; prior audit says LinkedIn API is not integrated. | Ownership and page-admin proof missing. | Human confirms page admin access and captures account URL. | Do not connect publisher until ownership and security are verified. |
| X/Twitter | `Human Action Required` | Platform is in scope; prior audit says X API is not integrated and paid tier may be required. | Account existence, owner, and posting path not proven. | Human verifies handle ownership and decides API vs aggregator path. | No API spend or OAuth setup without approval. |
| Instagram | `Human Action Required` | Platform is in scope; prior audit says Instagram Graph API requires Business Manager setup. | Business Manager linkage unknown. | Human confirms account type, Meta Business access, and admin owner. | Do not attempt Graph API connection yet. |
| TikTok | `Human Action Required` | Platform is in scope; prior audit says business account is required. | Business status and owner proof missing. | Human confirms business account status and login owner. | No publishing connector until account class is known. |
| YouTube | `Human Action Required` | Platform is in scope; prior audit says YouTube Data API is not integrated. | Channel URL, owner, and brand profile unknown. | Human confirms channel and admin access. | No upload scope authorization yet. |
| Threads | `Human Action Required` | Platform is in scope; prior audit says Threads API status was unverified. | Account linkage and API feasibility unknown. | Human verifies Threads account and Meta linkage. | Treat as manual-posting candidate until connector proof exists. |

## Demo Pass 1 Decision

No account advances beyond `Human Action Required` because the loop has target platforms but not ownership, security, profile, or connector evidence.

This is the desired behavior. The loop prevents the Social Engine from mistaking platform intent for operational readiness.

## Human Evidence Request

For each platform, collect:

- Account URL.
- Admin or owner name.
- Access method location, such as password manager entry name, without exposing secrets.
- MFA status.
- Recovery email or phone owner.
- Public profile screenshot or profile text.
- Business account or company-page status where applicable.
- Existing connector status, if any.

## Connector Evidence Request

For each account that reaches `Connector Candidate`, collect:

- Connector selected, such as Blotato, Restream, Buffer, Hootsuite, Publer, Metricool, or direct API.
- Connection owner.
- OAuth scope or permission class.
- Non-destructive verification result.
- Whether the connector can create drafts, schedule posts, or publish live.
- Whether manual human approval is enforced before live publishing.
- For Restream, whether the connector can list channels, verify destination access, retrieve recordings, and read broadcast analytics without changing live routing.

## Output Contract

Each loop run must produce:

- `readiness_matrix`: one row per platform account.
- `evidence_log`: proof supporting each state.
- `blocked_items`: action, owner, and unblock condition.
- `human_action_queue`: account work that must be completed outside the agent.
- `connector_action_queue`: safe technical checks for connector candidates.
- `next_loop`: recommended follow-up loop.

## CRS Transfer Criteria

Do not adapt this loop to CRS until OTAP has completed at least one account through `Ready for Draft Publishing` or produced a documented blocked handoff that the operator accepts.

When transferred to CRS, replace OTAP platform assumptions with CRS-specific brand controls:

- CRS brand owner.
- CRS domain and sender-auth alignment.
- CRS LinkedIn/company-page authority.
- Healthcare-compliance content approval gate.
- Patient-data exclusion rule.
- Final human approval before live publishing.

## Stop Conditions

Stop the loop when:

- Every platform reaches a terminal state for the current pass.
- Required ownership evidence is missing.
- A connector requires credentials, paid API access, or OAuth approval.
- Live posting would occur.
- The same blocker repeats for two passes without new evidence.
