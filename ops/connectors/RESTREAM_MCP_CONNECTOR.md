# Restream MCP Connector

## Purpose

Restream is the OTAP broadcast operations connector for live-stream readiness, event setup, destination checks, recording retrieval, clips, and post-stream analytics.

Use this connector as an evidence layer for the OTA agentic stack. It should prove which channels are connected, which events can be prepared, and what happened after a broadcast. It should not bypass human approval for live publishing.

## Configuration

| Field | Value |
|---|---|
| MCP server name | `restream` |
| Transport | Streamable HTTP |
| MCP URL | `https://mcp.restream.io/mcp` |
| Codex config location | `/Users/blackchain/.codex/config.toml` |
| Auth model | Restream OAuth through `codex mcp login restream` |

The server is registered globally for Codex with:

```bash
codex mcp add restream --url https://mcp.restream.io/mcp
```

If OAuth needs to be refreshed, run:

```bash
codex mcp login restream
```

## Operating Boundary

| Action Class | Allowed Without New Approval | Requires Explicit Approval |
|---|---:|---:|
| List connected channels or destinations | Yes | No |
| Check channel API access | Yes | No |
| Read event, stream, chat, clip, storage, or analytics metadata | Yes | No |
| Retrieve recording links for approved OTAP workflow use | Yes | No |
| Create draft or scheduled broadcast events | No | Yes |
| Change destinations or channel routing | No | Yes |
| Create, update, or delete clips | No | Yes |
| Start live publishing or trigger a broadcast | No | Yes |

## Scope Activation Recommendation

Do not turn on every unchecked write scope just to maximize capability. Turn on write scopes only when the OTA workflow is ready to use them with a human approval gate.

Recommended scope posture:

| Scope | Recommendation | Reason |
|---|---|---|
| `channels.write` | Keep off for now | This can add, delete, or change destinations. Enable only when OTAP is ready to manage Restream channels as governed account infrastructure. |
| `stream.write` | Enable when scheduling automation is approved | This is the core write scope for creating events and adding destinations. It is useful, but every event or destination change still needs operator approval. |
| `clips.write` | Enable after first completed broadcast workflow | Useful for creating or managing clips once recordings and post-stream QA are proven. |
| `storage.write` | Enable only for replay or upload automation | Useful if OTAP will upload files to Video Storage or create file-backed replay events. Keep off until that workflow is defined. |
| `studio.write` | Defer | Enable only if agents will manage Restream Studio assets, branding, captions, tickers, QR codes, or room setup. |

For the first production pass, keep the custom API app read-heavy and add `stream.write` only if the immediate goal is scheduled broadcast preparation. Add `clips.write` and `storage.write` in the next phase. Treat `channels.write` and `studio.write` as higher-control scopes.

Changing scopes after authorization may require re-authentication, so record scope changes in this runbook before updating the Restream application.

## OTAP Fit

Restream belongs after the Social Account Launchpad loop advances a platform account to `Connector Candidate` or better.

Expected OTAP uses:

- Verify which channels are connected to Restream before a campaign is scheduled.
- Prepare a broadcast event only after the account, profile, and approval gates are complete.
- Pull recording or storage links after a completed stream for VKE, NotebookLM, recap, and clip workflows.
- Pull event and channel analytics to score the broadcast as validation evidence.
- Record platform-level performance so future guests, topics, and channel choices can be compared.

## First Validation Pass

Run the first pass as read-only:

1. Confirm `codex mcp list` shows `restream` as enabled and logged in.
2. Use Restream MCP to list connected channels.
3. Use Restream MCP to check channel API access where available.
4. Record connected channels, missing channels, and permission gaps.
5. Do not create or schedule events until the operator approves a specific OTAP campaign.

## Evidence To Capture

| Evidence | Owner | Status |
|---|---|---|
| Restream OAuth completed in Codex | Human operator | Complete on 2026-06-30 |
| Connected channel list exported or summarized | Codex operator | Pending |
| Channel API access checked | Codex operator | Pending |
| First OTAP broadcast candidate selected | Human operator | Pending |
| Human approval policy confirmed for scheduled broadcasts | Human operator | Pending |

## Stop Conditions

Stop and request human approval when:

- OAuth asks for write scopes.
- A command would create, update, delete, schedule, or publish a live event.
- A destination is missing, disconnected, or requires account-owner action.
- Recording, clip, or analytics access exposes brand-sensitive material outside the OTAP review workflow.
- The same channel or OAuth blocker repeats after one retry.
