# Execution plane design

## Purpose

Execution Plane realizes only a short-lived authorization grant using a fixed tool adapter in an ephemeral Runner. It assumes model proposals, job messages, target responses, and tool outputs may be malicious.

## Components

| Component | Function | Hard limit |
| --- | --- | --- |
| Runner Lifecycle Manager | create、attest、quarantine、destroy microVM/VM | no reuse; no shared writable disk |
| Ephemeral Runner | execute fixed adapter | non-root; read-only base; no management socket/token |
| Tool Gateway | validate and mediate every tool call | ID/enums only; no raw command/URL/IP |
| Command Allowlist | adapter operation and option policy | exact structured invocation, no shell composition |
| Resource Quotas | CPU/memory/disk/PID/time/request/byte/token/tool budgets | platform ceiling ∩ ROE budget |
| Egress Firewall | dynamic scoped lease | default deny; range target + OP ingest only |
| Artifact Collector | collect bounded output and evidence | type/size/redaction/quarantine |
| Local Watchdog | security heartbeat and autonomous stop | no dependency on model/CP for quarantine |

## Runner security profile

- Firecracker microVM for Linux first choice; KVM/libvirt for Windows/special cases
- dedicated EP host pool; never co-resident with CP/CR/OP
- read-only signed base image and per-job encrypted scratch
- non-root user; capability drop; seccomp/LSM; no nested admin unless a specific synthetic scenario demands a separate target VM
- no Docker socket、containerd socket、Kubernetes service account、cloud user-data、metadata route
- no SSH/RDP general access; break-glass uses out-of-band freeze/console under incident procedure
- no host network、host PID、host filesystem mounts
- random per-job identifiers; no cross-job cache or writable volume
- core dumps and swap disabled for credential adapter; memory zeroization best-effort followed by VM destruction/key revoke

## Tool Gateway validation

Every call checks:

1. caller Runner/workload identity and attestation
2. engagement/job/execution and pinned manifest/policy generations
3. tool/test/profile ID membership and adapter digest
4. target ID membership and server-side destination mapping
5. action、parameter schema、enum/range、forbidden option
6. approval requirement and action-digest match
7. credential profile/purpose and Broker handle
8. time、rate、parallelism、retry、bytes、token、tool-call budget
9. firewall lease and expected destination/port
10. telemetry/stop/clock health

Validation occurs again on retries and long-running step boundaries.

## Command execution

Adapters call structured libraries/APIs. Where a process is unavoidable, the adapter constructs `argv[]` from fixed executable digest plus validated enum/numeric arguments, sets a minimal fixed environment, uses no shell, bounds stdout/stderr, and enforces timeout. The model cannot provide executable path、flag text、pipeline、redirection、script、URL。

## Egress

Default deny at VM namespace, host firewall, network fabric, and route table. Dynamic allow is per execution/target/profile and expires within minutes. DNS resolves only range zones. Internet/corporate/production/metadata/model endpoints are explicitly dropped and alerted for IPv4/IPv6.

## Artifact handling

Artifacts enter quarantine with size/type/archive-depth limits. Collect:

- structured adapter result and exit/status metadata
- bounded stdout/stderr after redaction
- process tree and syscall/security events
- file diff against baseline
- network flow/PCAP references
- tool/adapter/image/policy/approval digests

Active content is not rendered by privileged viewers. Raw artifacts are sent to OP restricted storage; the model receives only safe derivatives.

## Stop behavior

Local stop triggers include privilege anomaly、unexpected listener/flow、metadata/socket/API access、sensor loss、quota breach、same failure。Watchdog first removes network lease and freezes Runner, then requests revocation and evidence seal. CP unavailability never permits continuation.
