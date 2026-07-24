.PHONY: validate test test-schemas test-policy test-unit test-api test-architecture test-traceability docs-check typecheck secret-check supply-chain-check

validate:
	npm run validate

test: test-schemas test-policy test-unit test-api test-architecture test-traceability docs-check

test-schemas:
	npm run test:schemas

test-policy:
	npm run test:policy

test-unit:
	npm run test:unit

test-api:
	npm run test:api

test-architecture:
	npm run test:architecture

test-traceability:
	npm run test:traceability

docs-check:
	npm run test:docs

typecheck:
	npm run typecheck

secret-check:
	npm run test:secrets

supply-chain-check:
	npm --cache /tmp/cyber-eval-phase2-npm-cache --logs-dir /tmp/cyber-eval-phase2-npm-logs audit --audit-level=high
	npm sbom --sbom-format=cyclonedx | node -e 'JSON.parse(require("fs").readFileSync(0, "utf8")); console.log("SBOM JSON valid")'
