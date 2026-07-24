# ADR-010: Message queue

Status: Accepted; benchmark required  
Date: 2026-07-23

## Context

Jobs, lifecycle commands and status events need durable delivery and idempotency. Messages cross CP/EP but must not carry secrets or become an authorization bypass.

## Decision

Use NATS JetStream as the initial candidate for CP-owned job/status messaging, with per-service mTLS, subject allowlists, bounded retention, explicit ack, deduplication/idempotency and opaque IDs/digests only. Authorization is re-evaluated at consumers; the queue is not an authority. OP evidence ingest uses its own pipeline, not this queue.

## Alternatives

- RabbitMQ: mature routing/ack; heavier broker operations and credential/virtual-host governance.
- Kafka: strong ordered event log/scale; high complexity for modest command volume.
- cloud managed queue: lower operations; vendor/control/data path dependencies.
- database polling: simple; coupling and poor event isolation.

## Security consequences

Short subjects/ACLs and no secrets limit disclosure. Broker compromise can inject/replay/delay messages, so signatures、nonce、expiry、consumer policy and idempotency are mandatory. Queue outage denies dispatch.

## Operational consequences

Need cluster/quorum sizing、backup of non-secret state、dead-letter policy、bounded retention、lag SLO、schema registry and upgrade tests.

## Rejected options

- one queue shared with OP evidence: breaks independent audit boundary.
- message containing raw command/destination/credential.
- at-most-once without idempotency or evidence of loss.

## Revisit conditions

Benchmark against RabbitMQ and managed alternatives for HA、latency、operational skill、authorization features and offline/local deployment before Phase 02 selection.
