# ADR-013: GPT model context minimization

Status: Accepted for design  
Date: 2026-07-23

## Context

Model context may contain hostile target content and may be retained subject to provider controls. More context increases injection, secret, cost and cross-task contamination risk.

## Decision

Use task-scoped least context, deterministic extraction/redaction, provenance labels, explicit model/version and structured outputs. Present only narrow ID-based Tool Gateway functions. Disable hosted shell、web search、computer use、code interpreter、remote MCP and any model-accessible secret. Use `store=false` intent and ZDR if contractually approved.

## Alternatives

- full raw repository/log/PCAP context: potentially higher recall, unacceptable exposure/injection/cost.
- retrieval over curated derivatives: chosen pattern.
- local model: data control benefits, capability/operations/supply-chain tradeoffs.
- provider hosted tools: convenience, bypasses local complete mediation if enabled.

## Security consequences

Reduces blast radius but can omit relevant evidence. Mitigate with iterative bounded retrieval by artifact ID and explicit uncertainty. Structured output improves parsing but is not authorization. Provider/model compromise remains contained by deterministic controls.

## Operational consequences

Need redaction/DLP、context builder、prompt/model registry、evaluation corpus、token/cost accounting and data-control review. Model upgrades require representative eval.

## Rejected options

- relying on system prompt to prevent injection.
- passing Scope signing key/credential/raw restricted evidence.
- alias-only model routing without version/digest trace.

## Revisit conditions

Revisit model/tier/context size after precision/recall, injection, cost, retention and latency evaluations; never weaken deterministic authorization.
