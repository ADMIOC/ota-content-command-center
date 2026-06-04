# OTA Social Engine Operating Model

## Mission

OTA Social Engine is a 24/7/365 agentically engineered social marketing engine for researching, planning, creating, producing, publishing, communicating, scaling, and monetizing content across active OTA brands.

The Content Command Center is the operational surface for that engine. It should make the work visible, repeatable, measurable, and controllable while agents handle the heavy lift behind the scenes.

## Operating Principles

- Build agentically by default, with human approval gates where brand risk, publishing risk, spending, contracts, or regulated claims are involved.
- Keep every workflow traceable: source brief, generated direction, scripts, assets, approvals, storage URLs, publisher handoff, performance data, and improvement requests.
- Treat brand strategy as the source of truth for creative output. Every script, scene, audio track, render, caption, and publishing package must inherit brand context.
- Keep regulated brands safer by design. CRS and The VFO require compliance guardrails before production work can proceed.
- Keep secrets server-side. API keys, service credentials, and automation tokens must never live in static client code.
- Prefer modular agents with clear contracts over one opaque automation blob.

## Current Production Chain

1. Campaign setup
2. Scene planning
3. ElevenLabs script and audio tracks
4. Codex + Remotion assembly pass
5. Higgsfield Studio generation
6. Human QA
7. Final assembly
8. Publishing package
9. Bunny storage
10. Blotato handoff

## Agent Roles

### Lead Orchestrator

Codex coordinates architecture, workflow design, implementation, QA, documentation, integration strategy, and sub-agent tasking. The lead orchestrator owns the system map and makes sure each platform integration serves the business workflow.

### Research Agent

Finds market signals, audience pain points, competitor patterns, topical opportunities, hooks, content angles, and proof points. Outputs campaign briefs with citations, source links, and recommended positioning.

### Brand Strategy Agent

Maintains active brand profiles, brand voice, audience promises, forbidden claims, visual language, offer context, and monetization objectives. Outputs brand-tied creative direction.

### Creative Direction Agent

Generates cinematic campaign direction from brand, campaign, platform, and audience context. It defines point of view, emotional arc, visual tone, pacing, scene language, and storytelling constraints.

### Script Agent

Turns approved creative direction into video scripts, hooks, scene beats, narration, captions, and platform-specific variations.

### Compliance Agent

Applies compliance guardrails for regulated brands. CRS and The VFO require this agent before script/audio generation and before publishing handoff.

### Audio Agent

Prepares ElevenLabs voice profiles, script inputs, generated audio tracks, pronunciation rules, and audio asset references for downstream production.

### Remotion Agent

Ingests ElevenLabs script/audio output and generates Remotion compositions, caption timing, preview renders, and the approved production input for Higgsfield Studio.

### Visual Generation Agent

Prepares Higgsfield Studio inputs, tracks generated outputs, marks failed takes, and promotes usable clips into review.

### QA Agent

Checks visual quality, audio quality, compliance fit, caption accuracy, thumbnail direction, asset completeness, storage readiness, and publishing readiness.

### Storage Agent

Organizes Bunny folders, final media URLs, thumbnails, scripts, audio tracks, Remotion output, caption docs, scene files, and approval documents.

### Publishing Agent

Prepares Blotato-ready packages with approved media, captions, hashtags, platform notes, storage references, and scheduling status.

### Analytics Agent

Ingests performance data from publishing platforms and converts results into insights, next experiments, content repurposing ideas, and monetization recommendations.

### Communications Agent

Drafts stakeholder updates, reviewer requests, Slack/email summaries, issue comments, and internal progress reports from live workflow state.

### Monetization Agent

Connects content production to offers, funnels, lead capture, sponsors, affiliates, productized services, and revenue experiments.

## Platform Layers

### Planning Layer

- Content Command Center
- GitHub issues and project tracking
- Research sources
- Brand knowledge base
- Campaign briefs

### Production Layer

- ElevenLabs for script/audio track generation
- Codex + Remotion for audio-led composition
- Higgsfield Studio for video generation
- Human review for approvals

### Storage Layer

- Bunny for media library and CDN handoff
- Exported workspace manifests
- Future production database

### Publishing Layer

- Blotato for social publishing handoff
- Platform-specific captions, hashtags, and notes
- Future scheduling, retry, and publishing-state automation

### Feedback Layer

- GitHub issues for improvement requests
- QA checklists
- Performance analytics
- Content experiment history

### Monetization Layer

- Offer mapping
- Funnel tracking
- Lead capture
- Sponsorship and affiliate opportunities
- Revenue attribution

## Approval Gates

### Always Required

- Human approval before publishing
- Human approval before public claims about regulated brands
- Human approval before spending money through an integration
- Human approval before sending external communications on behalf of OTA
- Human approval before creating or changing credentials

### Regulated Brand Required

- CRS: compliance review for PHI, patient claims, eligibility claims, recovery claims, AI claims, and medical-adjacent language.
- The VFO: compliance review for investment, tax, legal, valuation, financing, return, exit, and fiduciary claims.

## Integration Roadmap

### Phase 1: Command Center Control Surface

- Active brand dropdown
- Brand-tied creative direction generation
- Regulated-brand compliance gating
- ElevenLabs and Remotion handoff tracking
- Bunny and Blotato package tracking
- GitHub review request lane

### Phase 2: Server-Side Automation

- Secure API proxy for ElevenLabs
- Secure Bunny upload service
- Remotion render job runner
- Asset manifest generator
- Persistent production database
- Authentication and role-based approval gates

### Phase 3: Agentic Production Loop

- Research-to-brief automation
- Brief-to-script automation
- Script-to-audio automation
- Audio-to-Remotion automation
- Remotion-to-Higgsfield package automation
- QA summary generation
- Publishing package generation

### Phase 4: Always-On Growth Engine

- Performance analytics ingestion
- Winning-content repurposing
- Automated experiment suggestions
- Monetization recommendations
- Cross-brand content calendar
- Stakeholder communications and daily digests

## Data Objects

### Brand Profile

- Brand name
- Regulated status
- Brand voice
- Audience
- Offers
- Cinematic perspective
- Compliance guardrails
- Platform preferences

### Campaign

- Brand
- Campaign name
- Platform
- Output quantity
- Owner
- Due date
- Creative direction
- Compliance guardrails
- Stage state
- Scenes
- Assets
- Approvals
- Publishing package
- Review requests

### Asset Manifest

- Final video URL
- Thumbnail URL
- Script URL
- ElevenLabs audio URL
- Remotion output URL
- Caption doc URL
- Scene files URL
- Approval doc URL
- Bunny folder

## Success Metrics

- Campaigns produced per week
- Time from brief to approved package
- Human rework rate
- Compliance issue rate
- Publishing package completeness
- Content performance by brand and platform
- Winning concepts repurposed
- Leads, revenue, sponsors, or monetization events influenced by content

## Immediate Next Builds

1. Persist active brand profiles as structured data instead of hardcoded arrays. Done in MVP via workspace state and export.
2. Add editable brand profile management to the Command Center. Done in MVP via the Brand Profile dialog.
3. Add a creative direction preview/regenerate history so creators can compare versions. Done in MVP via campaign-level direction versions.
4. Add script fields per scene before ElevenLabs handoff. Done in MVP via required scene script fields.
5. Add secure backend service boundaries for ElevenLabs, Bunny, Remotion, and Blotato. Done in MVP docs at `docs/backend-integration-boundaries.md`.
6. Add an agent activity log so automated work is visible and reviewable. Done in MVP via the Agent Operations activity log.
