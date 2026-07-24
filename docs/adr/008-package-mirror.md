# ADR-008: Package and image mirror

Status: Accepted for design  
Date: 2026-07-23

## Context

CR/EP cannot reach public registries, yet scenarios and tools need packages/images. A live proxy would create egress and supply-chain channels.

## Decision

Use a curated immutable mirror populated through a separate quarantine/import workflow. Fetch occurs outside CR/EP, then hash/signature/SBOM/provenance/malware/license review and two-person promotion produce a signed release. CR mirror is read-only, range-local and has no upstream.

## Alternatives

- transparent caching proxy: convenient; live egress and mutable upstream risk.
- full repository mirror: reproducible but large, includes unnecessary attack surface.
- per-scenario offline bundle: strongest minimization, higher authoring/duplication cost.
- removable media/manual copy: simple air-gap, weak automation/provenance if unmanaged.

## Security consequences

Eliminates target-triggered external dependency fetch and constrains artifacts. A trusted import/build compromise remains; signatures do not prove benign content. Behavioral sandbox and source review remain necessary.

## Operational consequences

Promotion SLA、storage、dependency closure、revocation、patch cadence and expired artifact handling must be run. Per-scenario manifests pin digests.

## Rejected options

- live npm/pypi/OS/container registry access from Runner/range.
- mutable `latest` tags or unpinned versions.
- model-requested package installation.

## Revisit conditions

Revisit mirror technology after ecosystem inventory and storage sizing, preserving no-upstream/read-only/pinned/provenance properties.
