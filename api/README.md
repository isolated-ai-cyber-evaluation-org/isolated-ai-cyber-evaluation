# API contracts — Phase 2

`openapi.yaml` is an interface-only OpenAPI 3.1 contract. There is no server, listener, client, router, network adapter, authentication implementation, or deployment target.

Normative restrictions:

- no `servers` entry
- all model-visible operations use opaque IDs and enums
- no URL、IP、hostname、command、shell、credential value fields
- the only mutation-like endpoint is emergency termination, which reduces authority
- `/v1/tool-requests` ends at `DenyOnlyToolGateway`
- a Policy `PERMIT` still returns `EXECUTION_DISABLED`
- mutual TLS is declared as a future boundary requirement but no certificate/key is handled here

The JSON Schema in `schemas/tool-request.schema.json` is the canonical tool-request structure.
