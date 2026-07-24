import {ControlPlaneError} from "../domain/control-plane.ts";
import type {AppendOnlyAuditSink} from "../interfaces/audit-sink.ts";
import type {ControlPlaneToolGateway} from "../interfaces/control-plane-tool-gateway.ts";
import type {
  AuthorizationAttempt,
  PolicyEngineAdapter
} from "../interfaces/policy-engine-adapter.ts";
import type {ToolResponseEnvelope} from "../api/model-tools.ts";
import {AuditEventFactory} from "../services/audit-event-factory.ts";

export class LocalToolGatewayMock implements ControlPlaneToolGateway {
  readonly #policyAdapter: PolicyEngineAdapter;
  readonly #auditSink: AppendOnlyAuditSink;
  readonly #auditFactory: AuditEventFactory;

  constructor(
    policyAdapter: PolicyEngineAdapter,
    auditSink: AppendOnlyAuditSink,
    auditFactory: AuditEventFactory
  ) {
    this.#policyAdapter = policyAdapter;
    this.#auditSink = auditSink;
    this.#auditFactory = auditFactory;
  }

  async request(
    input: AuthorizationAttempt
  ): Promise<ToolResponseEnvelope> {
    try {
      await this.#auditSink.append(this.#auditFactory.create({
        ...input,
        eventType: "TOOL_REQUEST_INTENT"
      }));
    } catch {
      throw new ControlPlaneError("AUDIT_APPEND_FAILED");
    }

    const decision = await this.#policyAdapter.authorize(input);
    switch (decision.result) {
      case "PERMIT":
        return {
          status: "not-implemented",
          reasonCode: "MOCK_EXECUTION_DISABLED",
          policyResult: decision.result
        };
      case "REQUIRE_APPROVAL":
        return {
          status: "denied",
          reasonCode: "APPROVAL_REQUIRED",
          policyResult: decision.result
        };
      case "DENY":
        return {
          status: "denied",
          reasonCode: decision.reasonCode,
          policyResult: decision.result
        };
      case "INDETERMINATE":
        return {
          status: "denied",
          reasonCode: "POLICY_INDETERMINATE",
          policyResult: decision.result
        };
      case "TERMINATE":
        return {
          status: "stopped",
          reasonCode: decision.reasonCode,
          policyResult: decision.result
        };
    }
  }
}
