# Observability plane design

## Purpose

Observability Plane is an independent security and evidence boundary. It receives append-only events from CP/EP/CR, detects stop conditions, preserves tamper-evident evidence, and scores both targets and agent behavior.

## Data sources

- centralized structured audit logs
- network flow and packet capture references/full capture per profile
- Runner and target process trees
- filesystem baseline/diffs
- OpenTelemetry logs/traces/metrics
- host/hypervisor/network/security sensor events
- Policy、Scope、Approval、Credential issuance/revocation metadata
- model request metadata, tool call traces, token/time/cost (no secret/raw restricted prompt by default)
- scenario health and synthetic control detections

## Ingest boundary

Producers possess append-only, schema-specific identities. They cannot query, list, update, delete, alter retention, release holds, administer SIEM, or change scoring. CR target workloads do not send directly; sensor-owned gateway exports through a one-way path.

Each event has:

- event ID、schema version、producer identity
- engagement/scenario/job/execution/runner/target correlation IDs
- monotonic sequence and timestamp with clock uncertainty
- event type/severity
- content digest and previous-event digest where chained
- component/image/tool/model/prompt/policy/manifest/approval digests as applicable
- classification and retention class

## Pipeline

`Producer buffer → authenticated ingest → schema/sequence validation → immutable raw store → normalized security stream → SIEM/detectors → score/evidence index`

Normalization never overwrites raw event. Parser failures and gaps are recorded as evidence and may trigger stop.

## Stop detection

High-priority detectors cover all normative stop conditions:

- out-of-scope address/domain/repository/cloud asset
- Internet/corporate/production attempt
- unauthorized tool/action
- unexpected root/privilege/persistence/listener
- log/sensor/config tamper
- credential search/honey marker
- metadata/Docker/Kubernetes management access
- rate/data/time/token/tool/retry budget
- Policy/Scope file change
- sensor/telemetry health loss
- target service health threshold

Detector emits a signed, anti-replay stop message to the CP Emergency Stop endpoint. EP watchdog separately enforces local stop so OP-to-CP failure cannot keep a job running.

## Evidence store

WORM/object-lock storage, separate OP KMS, per-engagement key, hash chain/checkpoint, cross-failure-domain replica. Raw restricted evidence is never model-readable. Derived evidence maintains transformation lineage.

## SLOs and health

Design SLOs require human calibration:

- audit/event ingest latency and loss rate
- detector-to-firewall quarantine latency
- credential revocation confirmation latency
- evidence seal completeness
- clock drift
- sensor heartbeat coverage
- WORM replication lag

Threshold breach stops affected jobs; SRE cannot bypass this for availability.

## Privacy and cost controls

PCAP/raw logs are bounded by profile, duration, byte ceiling, and retention class. Structured redaction occurs before downstream indexing, but immutable restricted raw evidence remains separately access-controlled where required. Duplicative high-volume data can be content-addressed while preserving chain-of-custody.
