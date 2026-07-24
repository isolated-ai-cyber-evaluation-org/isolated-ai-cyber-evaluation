# ADR-011: WORM evidence

Status: Accepted; product open  
Date: 2026-07-23

## Context

Audit/evidence must resist deletion or alteration by Execution/Range and ordinary administrators while supporting retention, legal hold, restore and verified expiry deletion.

## Decision

Use OP-owned object-lock/compliance-mode WORM storage plus per-object hashes, per-execution hash chain, signed periodic checkpoints and independent replica. Access indexes are mutable derivatives; raw evidence is immutable. Product mapping is deferred.

## Alternatives

- cloud object lock: strong managed semantics, provider/account/legal dependencies.
- on-prem WORM appliance: local control, hardware/procurement/restore complexity.
- append-only database: queryable, weaker against privileged mutation without external anchor.
- blockchain/public ledger: unnecessary disclosure/complexity and does not store evidence safely.

## Security consequences

Protects against producer and many admin tampering. KMS/root admin collusion、retention misconfiguration、corrupt-but-valid ingest remain; identity、sequence、checkpoint and two-person retention controls mitigate.

## Operational consequences

Capacity/retention cost、legal hold、restore drills、replication、key custody and deletion certificates. Cannot “fix” bad raw events; append correction.

## Rejected options

- ordinary mutable object store/log index as authoritative evidence.
- execution-owned encryption/deletion key.
- public blockchain anchoring as primary control.

## Revisit conditions

Choose product after legal retention and deployment decision; require tested retention shortening/delete denial, replica restore and KMS separation.
