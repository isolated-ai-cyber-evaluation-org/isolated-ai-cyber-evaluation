import type {
  ModelToolRequest,
  ToolResponseEnvelope
} from "../api/model-tools.ts";
import type {PolicyEngine} from "../interfaces/policy-engine.ts";
import type {ToolGateway} from "../interfaces/tool-gateway.ts";
import type {PolicyInputContext} from "../policy/types.ts";

export class DenyOnlyToolGateway implements ToolGateway {
  readonly #policyEngine: PolicyEngine;

  constructor(policyEngine: PolicyEngine) {
    this.#policyEngine = policyEngine;
  }

  async request(
    toolRequest: ModelToolRequest,
    context: PolicyInputContext
  ): Promise<ToolResponseEnvelope> {
    const decision = await this.#policyEngine.evaluate({
      ...context,
      request: toolRequest
    });

    switch (decision.result) {
      case "PERMIT":
        return {
          status: "not-implemented",
          reasonCode: "EXECUTION_DISABLED",
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
