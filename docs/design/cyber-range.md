# Cyber range design

## Objective

Provide disposable, synthetic, observable targets for authorized defensive evaluation without any route to the general Internet, corporate network, production network, or real cloud account.

## Scenario families

| Family | Synthetic assets | Example defensive objectives |
| --- | --- | --- |
| Web/API | deliberately vulnerable training app、reverse proxy、WAF、API gateway | finding validation、WAF/detection、patch regression |
| Linux network | multi-host services、bastion-like target、IDS sensors | segmentation/detection/BAS |
| Windows domain | isolated AD-like domain、member endpoints、EDR simulator | identity/detection/control validation |
| Container/Kubernetes | disposable target cluster inside range | image/IaC/RBAC/network-policy evaluation |
| Cloud configuration | local API emulators and declarative IAM/storage models | policy/config misconfiguration evaluation |

The cloud family does not connect to or create real provider resources in Phase 01/initial implementation. Real cloud exercises require a future ADR, dedicated accounts, service control policies, budget guardrails, and new authorization.

## Internal dependencies

- range-only authoritative DNS with no recursion/forwarding
- range-only PKI and synthetic certificates
- range-only IdP and dummy identities
- curated read-only package/container mirror populated by offline signed promotion
- deterministic time service/clock offset profiles when a scenario needs them
- synthetic email/webhook/event sinks that never relay externally

## Network zones

Each engagement receives a separate virtual fabric with:

- ingress test segment reachable only from the assigned EP Tool Gateway
- target segments defined by scenario
- sensor taps/virtual switches owned by Range infrastructure
- dependency segment for DNS/PKI/IdP/mirror
- management segment reachable only from CR admin plane, never from target/Runner
- no default route; no NAT、proxy、VPN、transit、peering

Scenario-required lateral paths are explicit and limited to that engagement.

## Scenario manifest and lifecycle

`scenario.schema.json` defines immutable template/version/digest、asset IDs/types/images、network zones/flows、synthetic-data attestation、dummy credential profiles、ground truth reference、baseline health、reset/destruction plan。

Lifecycle:

1. validate signed scenario and all artifact signatures/SBOM/provenance
2. allocate isolated fabric, keys, DNS/PKI/IdP namespace
3. instantiate images from read-only base
4. attest topology, routes, firewall, sensor coverage, health, synthetic-only data
5. mark `READY`; otherwise destroy
6. execute one engagement or explicitly isolated cohort
7. seal evidence and score inputs
8. reset or destroy; default is destroy
9. perform residual scan and issue destruction certificate

## Kubernetes target safety

Target Kubernetes is nested/dedicated within CR, not the CP/EP orchestration cluster. Tool access is through target-specific adapter and limited synthetic credential. Range infrastructure management API、host kubeconfig、node runtime socketはtargetから到達不能。Admission policy prohibits hostPath、hostNetwork、privileged workload unless a specifically approved scenario uses an inner disposable VM and compensating isolation.

## Windows safety

Windows images are organization-built, licensed, patched baseline plus scenario layer. No corporate domain trust、enterprise certificate、production GPO、real EDR tenant credential。Time-limited dummy domain credentials and local update/package mirror only.

## Ground truth

Scenario ground truth is held in OP/evaluation custody, not model context or target-readable storage. It lists expected findings、safe markers、expected detections、forbidden effects、reset proof。Authors and scorers use separated roles where practicable.

## Scenario authoring controls

- use synthetic data generator and reserved example namespaces
- no public IP/domain or routable external callback
- no destructive payload、persistence、evasion、credential dump
- known vulnerabilities represented by training fixtures or harmless proof markers
- required stop signals and rollback/reset tests
- peer review、signature、SBOM、provenance、version pin

## Capacity and noisy-neighbor control

Per-engagement CPU/memory/storage/network ceilings at hypervisor/fabric level. Scenario health thresholds stop tests before service harm. DoS behavior is not an allowed test objective; load testing requires a separate future system.
