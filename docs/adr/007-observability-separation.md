# ADR-007: Observability plane separation

Status: Accepted for design  
Date: 2026-07-23

## Context

Compromised CP/EP/CR must not delete or alter evidence. Shared logging accounts, clusters, credentials, or admin roles would invalidate this property.

## Decision

Place OP in a separate account/project, network, host/cluster, PKI trust domain, KMS hierarchy and human admin domain. Producers receive append-only ingest identity only. OP exposes a single stop-only path to CP; no general management path to other planes.

## Alternatives

- same account with IAM separation: lower cost; common root/admin blast radius.
- external managed SIEM only: independent service; raw evidence/WORM/control details may not meet all requirements.
- dual local+external: stronger resilience; higher cost/consistency complexity.

## Security consequences

Improves tamper resistance and insider separation. OP itself becomes high-value and needs WORM、hash chain、replication、separate auditor and key custody. Stop path could be abused for availability but not execution.

## Operational consequences

Separate on-call、billing/capacity、PKI、backup/restore and cross-boundary ingest. Troubleshooting is more complex because producers cannot query.

## Rejected options

- execution-managed log store: attacker could erase evidence.
- shared Kubernetes cluster/node: shared admin/runtime violates boundary.
- producer delete for “cleanup”: incompatible with chain of custody.

## Revisit conditions

Boundary may be strengthened to an external regulated archive; it may not be collapsed without an equivalent independent root-of-trust analysis and risk acceptance.
