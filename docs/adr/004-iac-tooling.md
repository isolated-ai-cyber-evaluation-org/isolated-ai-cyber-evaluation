# ADR-004: Infrastructure as Code

Status: Accepted for design  
Date: 2026-07-23

## Context

Four-plane separation, network deny rules, identity, WORM, and disposable lifecycle must be reproducible across local and possible cloud environments.

## Decision

Use OpenTofu as the primary declarative IaC engine. Use image-building and configuration tools only behind pinned, signed pipelines. Keep provider-specific modules separated from normative architecture and test plan/apply outputs with policy.

## Alternatives

- Terraform: mature ecosystem; licensing/governance and distribution considerations.
- Pulumi: general-language expressiveness; larger runtime/dependency and imperative-risk surface.
- Crossplane: Kubernetes-native reconciliation; couples infrastructure authority to cluster compromise.
- Ansible: useful configuration management; not primary resource-state engine.
- manual provisioning: not reproducible/auditable.

## Security consequences

OpenTofu enables plan review, policy checks, drift detection and version pinning. State files are sensitive and require encryption, separate credentials, locking and no secrets where avoidable. Provider compromise and plan-time data leakage remain risks.

## Operational consequences

Maintain module registry、provider locks、state backend、CI plan evidence、drift scans。Local virtualization providers may have uneven maturity.

## Rejected options

- manual console changes: breaks reproducibility and traceability.
- Crossplane as root infrastructure authority: a compromised Kubernetes control plane would gain too much reach.
- unpinned community modules/providers: supply-chain risk.

## Revisit conditions

Revisit after target environment selection, provider maturity assessment, or if an organization-standard IaC meets equivalent signing、plan、drift and state protections.
