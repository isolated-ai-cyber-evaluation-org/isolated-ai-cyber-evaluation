# ADR-006: Local-first versus cloud

Status: Accepted for design  
Date: 2026-07-23

## Context

The range must have no Internet/corporate/production path. Local dedicated equipment offers physical control; cloud offers elastic accounts and managed controls but introduces metadata, service endpoints, control-plane APIs, provider retention and routing complexity.

## Decision

Adopt a local-first dedicated-lab baseline for initial release, with no physical uplink from CR. Keep interfaces/IaC portable so a later cloud deployment can reproduce each plane in separate accounts/projects after a dedicated ADR and security proof.

## Alternatives

- local-first: strongest intuitive air-gap and predictable cost, slower capacity/patch/hardware operations.
- cloud-first: elastic and managed WORM/KMS, harder proof of no service/control path and provider dependencies.
- hybrid: flexible but most routing/trust complexity.

## Security consequences

Local-first reduces accidental public route and metadata exposure, but physical mispatch, administrator access and local WORM quality remain. Cloud can offer strong account isolation/object lock but must address metadata、egress、service endpoints、provider admins and data region.

## Operational consequences

Requires dedicated hardware, facilities, spare capacity, image import station and separate OP storage. Cloud parity work is deferred.

## Rejected options

- hybrid initial release: too many trust paths before controls are proven.
- range in a corporate virtualization cluster: violates host/network/admin separation.
- real cloud IAM scenarios in production-like accounts: outside initial scope.

## Revisit conditions

Revisit after local pilot, cloud threat model, provider selection, contractual/data-residency review, and independent proof of route/account separation.
