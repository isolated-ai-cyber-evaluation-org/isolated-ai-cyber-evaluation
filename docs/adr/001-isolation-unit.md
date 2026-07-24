# ADR-001: Isolation unit roles

Status: Accepted for design  
Date: 2026-07-23

## Context

Runner and hostile range targets may execute intentionally vulnerable software. Candidate primary boundaries are process/container、microVM、full VM。Isolation strength, startup time, image support, telemetry, density, and operational cost differ.

## Decision

Use microVM as the default Linux Runner boundary, full VM for Windows and scenarios requiring richer hardware/kernel behavior, and containers only as an inner packaging/target mechanism. No container alone separates an untrusted evaluation from a host or another plane.

## Alternatives

| Option | Isolation | Startup/density | OS support | Operational cost |
| --- | --- | --- | --- | --- |
| OCI container | shared kernel; weakest | best | Linux userspace | low |
| microVM | separate guest kernel; strong | near-container | primarily Linux | medium |
| full VM | mature hardware boundary; strongest/flexible | slowest/lower density | Linux/Windows | high |

## Security consequences

Positive: kernel boundary reduces shared-kernel escape blast radius; full VM supports Windows safely; dedicated host pools preserve plane separation. Negative: hypervisor remains critical and requires patching/attestation; inner containers must not be mistaken for primary isolation.

## Operational consequences

Maintain signed microVM and VM images, host pools, guest telemetry, and two lifecycle paths. Capacity is lower than container-only design.

## Rejected options

- container-only hostile workload isolation: shared-kernel risk is inconsistent with threat model.
- full VM for every Linux job: secure but unnecessary startup/capacity cost for bounded adapters.
- same host for different planes: violates host separation invariant.

## Revisit conditions

Revisit after independent escape benchmarking、hardware-confidential VM adoption、material Firecracker/KVM vulnerability trend、or a new workload requiring unsupported devices.
