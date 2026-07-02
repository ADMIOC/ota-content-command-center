# OTA Social Engine Phase 7 Connector Activation And Brand Buildout

## Status

Started on 2026-06-30.

Phase 7 moves the OTA Social Engine from Restream credential setup into operational buildout. The system now tracks whether a connected Restream destination actually matches the selected social profile, records platform-side activation blockers, and uses the first four brands as the working build queue.

## Phase 7 Goal

Turn the Social Profile by Brand command center into a usable operating platform for the first four brands, with OTAP YouTube as the proof profile.

The phase is not complete when credentials exist. It is complete when each priority profile has sourced profile details, approved media assets, evidence, connector status, and a concrete next action.

## Current Proof Profile

| Field | Value |
| --- | --- |
| Brand | Own The Algo Podcast |
| Platform | YouTube |
| Handle | `@ownthealgo` |
| Current display name | Agentic Jey |
| Restream OAuth | Connected |
| Restream destination match | Matched |
| Matching destination | Agentic Jey, YouTube |
| Non-matching destination also present | Jeffrey Jey Lawrence, LinkedIn |
| Publishing state | Blocked |
| Blocker | YouTube live streaming activation waiting period |
| Requested at | June 30, 2026 at 5:06 PM Pacific |
| Expected activation | July 1, 2026 at approximately 5:06 PM Pacific |

## What Phase 7 Adds

| Area | Result |
| --- | --- |
| Connected destination validation | Restream channels are fetched through OAuth and stored as sanitized metadata. |
| Profile-specific matching | A connected channel must match the selected platform, not merely exist in Restream. |
| Activation blocker tracking | YouTube live-stream activation wait is recorded as a publishing blocker. |
| Operator next action | The app shows the exact next action and activation target inside the profile workspace. |
| First-four brand queue | OTAP, CRS Healthcare Solutions, WYR Detail, and The VFO remain the buildout scope. |

## Phase 7 Gates

| Gate | Pass Condition |
| --- | --- |
| Profile content | Required profile fields are populated from brand sources. |
| Media assets | Profile image, banner, and relevant launch assets are attached with dimensions. |
| Evidence vault | Ownership, profile review, security, and connector proof are recorded. |
| Restream OAuth | Client ID, client secret, access token, and refresh token refs are stored. |
| Destination match | Restream connected destination matches the social platform profile. |
| Platform activation | Platform-side live/publishing eligibility is active or explicitly deferred. |
| Approval | Human approval is recorded before publishing or external submit actions. |

## Platform Asset Reconciliation

When an account already has image, GIF, or video assets on the social platform, the command center should not overwrite them blindly.

Use this sequence:

1. Observe the live social profile.
2. Record the existing avatar, banner, highlight cover, pinned media, video, or screenshot URL in Step 2.
3. Mark the asset status as `Observed On Platform`, `Keep Current`, `Replace Recommended`, or `Approved Current`.
4. Compare the observed asset against the brand kit and platform dimensions.
5. Upload a replacement only when the existing platform asset is off-brand, low quality, incorrectly sized, or not approved.

The app now supports platform-observed asset records. These records can store the external asset link, asset type, usage context, status, and review description without requiring a local file upload.

When an operator enters an `Actual Handle`, the app should treat the account shell as created. From that point forward, Codex-assisted completion is expected to:

1. Derive or confirm the canonical profile URL.
2. Fill missing brand-aligned profile fields.
3. Offer a platform scan from the profile workspace.
4. Surface detected platform metadata and observed assets directly in Step 2.
5. Keep detected assets in `Observed On Platform` status until a human approves, replaces, or uploads a controlled source asset.

Automation rule: platform scanning should use official APIs or authenticated operator review where available. Public scraping should be treated as a fallback evidence capture method, not the canonical source of truth, because social platforms often restrict direct asset URLs and may expire CDN links.

## OTAP YouTube Current Next Action

Return after July 1, 2026 at approximately 5:06 PM Pacific, open the YouTube Live Dashboard to confirm live streaming is active, then re-run `Validate Channels` in Step 4.

If Restream still reports pending verification after the YouTube activation window, keep the profile in `Publishing Blocked` and capture a new evidence screenshot.

## First Four Brand Buildout Scope

| Brand | Priority | Phase 7 Work |
| --- | --- | --- |
| Own The Algo Podcast | P0 | Complete YouTube activation, profile approval, media approval, and then continue Instagram/Facebook/LinkedIn/TikTok sourcing. |
| CRS Healthcare Solutions | P0 | Source public-safe profile copy and assets while preserving healthcare governance and no-PHI boundaries. |
| WYR Detail | P1 | Source local/service profile details, visual assets, and platform-specific next actions. |
| The VFO | P1 | Source professional authority profile details, evidence, and platform-specific connector readiness. |

## Implementation Notes

| File | Change |
| --- | --- |
| `server/local.mjs` | Adds read-only Restream channel validation and platform-specific match state. |
| `src/main.jsx` | Shows Phase 7 label, connected destination match count, YouTube activation state, and activation target. |
| `data/social-engine-state.json` | Stores OTAP YouTube activation blocker and expected activation timestamp. |

## Exit Criteria

Phase 7 is complete when OTAP YouTube reaches one of these outcomes:

1. YouTube live activation is confirmed active, Restream validation still matches the YouTube destination, and the profile can move from `Publishing Blocked` to connector-ready.
2. YouTube activation remains blocked after the expected activation window, and the blocker is captured as evidence with a documented retry path.

After OTAP YouTube reaches a stable outcome, continue the first-four brand buildout using the same profile, asset, evidence, and connector readiness pattern.
