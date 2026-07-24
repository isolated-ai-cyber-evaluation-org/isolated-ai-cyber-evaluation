# ADR-009: Secret management and Credential Broker

Status: Accepted; product open  
Date: 2026-07-23

## Context

Credentialed synthetic tests are required, but secrets cannot enter model context, environment variables, files, logs, or generic Runner processes.

## Decision

Use an HSM/KMS-backed Credential Broker with dynamic, target/purpose/action-bound, short-lived credentials. Prefer proxy/delegated authentication. If delivery is necessary, use a separate memory-only credential adapter with opaque one-use handle and immediate revocation.

## Alternatives

- Vault-like dynamic secrets: strong issuance/revoke, operational complexity.
- cloud secret manager: managed, provider-bound and often static retrieval semantics.
- HSM custom broker: strongest key custody/control, highest implementation cost.
- sealed file/env injection: common but violates non-exposure requirement.

## Security consequences

Central Broker is critical. It reduces model/Runner exposure and supports revocation, but Broker/adapter compromise remains Critical. Separate admin role、HSM keys、mTLS、no value logging、honey markers and memory-hardening are mandatory.

## Operational consequences

Need HA without fail-open, rotation, target adapter integrations, audit metadata, emergency revoke and recovery. Product selection depends on environment.

## Rejected options

- environment variable/file/Kubernetes Secret delivery to model-facing Runner.
- long-lived shared test password.
- plaintext secret in queue/approval/tool argument.

## Revisit conditions

Select product after proof-of-concept demonstrates proxy auth、single-use binding、revocation latency、no log/env/file exposure and separate administration.
