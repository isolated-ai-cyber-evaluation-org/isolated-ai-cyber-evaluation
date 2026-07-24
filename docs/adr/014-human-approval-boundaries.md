# ADR-014: Human-in-the-Loop approval boundaries

Status: Accepted for design  
Date: 2026-07-23

## Context

Human approval is required for state change, exploit validation and credential use, but vague approvals are replayable and encourage rubber-stamping.

## Decision

Require canonical, content-bound, expiring, one-shot approval for these action classes. Bind target、tool/test/profile、parameter digest、credential purpose、Scope/policy generation、budgets and expected effects. Requester cannot approve own high-risk action; critical classes may require two approvers. Stop never requires approval; resume does.

## Alternatives

- per-engagement blanket approval: low friction, excessive authority and replay.
- per-tool approval without parameters: misses harmful option changes.
- fully automatic risk scoring: scalable but model/policy errors can cause state change.
- interactive terminal confirmation: poor audit/reproducibility and shell-oriented.

## Security consequences

Limits confused-deputy and replay. Human account compromise、collusion、poor UI remain. Phishing-resistant MFA、canonical diff、risk cues、SoD、expiry、audit and periodic quality review mitigate.

## Operational consequences

Adds latency/on-call load and requires approval SLA/escalation. Batching is allowed only when every bounded action is enumerated and the batch cannot expand.

## Rejected options

- model self-approval or natural-language “approved” text.
- approval ID supplied by model without server-side digest resolution.
- break-glass that broadens Scope or enables Internet.

## Revisit conditions

Revisit approval granularity after pilot human-factors and false-positive data. Any automation reduction requires evidence and cannot cover the three mandatory classes without governance amendment.
