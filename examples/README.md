# Synthetic manifest examples

These files contain synthetic IDs, dummy digests, and structurally valid **placeholder** signatures for schema testing. The placeholder signature values are not cryptographic authorization and a real signature verifier must reject them.

Phase 02 must add RFC 8785/DSSE test vectors with a repository-only public test key and verify:

- valid signature
- changed payload
- wrong key/role
- revoked/expired key
- duplicate YAML key
- non-canonical equivalent input
- generation and cross-document mismatch

No example contains a real system、domain、credential、person or routable target.
