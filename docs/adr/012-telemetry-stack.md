# ADR-012: Logs, metrics, and traces

Status: Accepted for design  
Date: 2026-07-23

## Context

Multiple OS/runtime types need correlated telemetry without binding authorization/evidence semantics to one vendor.

## Decision

Use OpenTelemetry schemas/collectors as the normalization and transport baseline, plane-local bounded exporters, and OP-owned backends. Raw security evidence/PCAP remains in WORM; SIEM/search backends are replaceable indexes. Metrics/traces/logs share correlation IDs but not necessarily one storage product.

## Alternatives

- vendor-native agents/backend: fast integration, lock-in and inconsistent cross-plane semantics.
- Elastic/OpenSearch stack: broad logs/search, operational/storage cost.
- Loki/Prometheus/Tempo: composable, weaker single-pane security analytics without SIEM.
- ClickHouse-based pipeline: high performance, more schema/operations work.

## Security consequences

Vendor-neutral correlation improves auditability. Collectors are privileged sensors and must be hardened; telemetry content can contain secrets, so redaction/classification and raw restricted storage separation are required. Missing heartbeat causes stop.

## Operational consequences

Maintain semantic conventions、schema versions、collector configs、backpressure、clock drift、sampling policy。Security events are never sampled away.

## Rejected options

- local log files as authority.
- one backend/account shared with workloads.
- sampling authorization/stop/evidence events.

## Revisit conditions

Select concrete SIEM/index/metric/trace products after volume/cost/query tests, preserving OP separation, append-only raw evidence and OTel-compatible contracts.
