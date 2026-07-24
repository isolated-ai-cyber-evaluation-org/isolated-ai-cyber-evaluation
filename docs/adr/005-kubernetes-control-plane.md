# ADR-005: Kubernetes for control services

Status: Accepted with risks  
Date: 2026-07-23

## Context

Kubernetes offers scheduling and service operations but its API, service accounts, admission chain, node runtime, and supply chain create a high-value control target.

## Decision

Kubernetes may host stateless/control services in a dedicated CP cluster only. It must not host EP Runners, CR targets, OP evidence services, or Credential Broker/HSM root material. Public API、privileged pods、hostPath/hostNetwork、wildcard RBAC、Docker socket、default service-account tokens are prohibited.

## Alternatives

- dedicated Kubernetes: operational ecosystem and HA, with material control-plane risk.
- systemd/VM services: smaller orchestration surface, more bespoke HA/rollout work.
- Nomad or equivalent: simpler in some environments, smaller organizational ecosystem.
- serverless/cloud managed: reduced node ops, vendor/data/network constraints.

## Security consequences

Cluster compromise could alter orchestration or call authorization services; therefore immutable external manifest/policy roots、separate Broker、OP evidence separation、network egress constraints and workload identity are mandatory. Kubernetes is never the only enforcement layer.

## Operational consequences

Requires hardened private API、separate admin network、admission policy、network policy plus external firewall、etcd protection、audit、upgrade cadence and cluster recovery drills.

## Rejected options

- one shared cluster/node pool for four planes: violates trust boundaries.
- Kubernetes service account as target credential: cross-boundary secret exposure.
- privileged Runner pods: management API/runtime escape risk.

## Revisit conditions

Reject Kubernetes before implementation if the organization cannot operate private API、strict RBAC/admission、dedicated nodes and external controls. Revisit simpler VM services at prototype review.
