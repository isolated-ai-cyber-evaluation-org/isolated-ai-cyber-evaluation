# ADR-002: Firecracker, Kata Containers, and KVM/libvirt

Status: Accepted for design  
Date: 2026-07-23

## Context

The platform needs fast disposable Linux Runners, Windows support, and possibly Kubernetes integration without sharing a control or host boundary.

## Decision

Use Firecracker for default Linux Runners. Use KVM/libvirt for Windows and complex range VMs. Consider Kata Containers only where Kubernetes-native scheduling is a measured requirement; it is not the baseline and cannot share the CP cluster or worker pool.

## Alternatives

- Firecracker: small device model, fast microVM, higher custom lifecycle/integration work.
- Kata Containers: VM-backed pod UX, easier Kubernetes integration, broader Kubernetes/runtime attack surface.
- KVM/libvirt: flexible/mature and Windows-capable, heavier lifecycle and larger device surface.

## Security consequences

Firecracker minimizes exposed device surface. KVM/libvirt requires hardening templates and dedicated pools. Kata inherits Kubernetes、CRI、shim、network-plugin control paths in addition to VM isolation. All require signed images, patched hosts, IOMMU/device restrictions, no host sockets, and attestation.

## Operational consequences

Two baseline stacks increase skills and observability work. Firecracker needs custom image/network lifecycle; libvirt needs capacity and Windows image governance. Kata is deferred to avoid premature cluster complexity.

## Rejected options

- Kata everywhere: operationally attractive but expands trusted computing base and couples Runner security to Kubernetes.
- libvirt everywhere: slower/dense Linux workload tradeoff.
- nested virtualization without scenario-specific approval: increases complexity and weakens assurance.

## Revisit conditions

Revisit after prototype benchmark for boot latency、escape surface、Windows support、telemetry completeness、patch cadence、operator skill and cost.
