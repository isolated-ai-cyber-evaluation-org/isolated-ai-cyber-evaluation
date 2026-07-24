import type {PolicyInput, PolicyDecision} from "../policy/types.ts";

export interface PolicyEngine {
  evaluate(input: PolicyInput): Promise<PolicyDecision>;
}
