import type {PolicyEngine} from "../interfaces/policy-engine.ts";
import type {PolicyDecision, PolicyInput} from "../policy/types.ts";

export class UnavailablePolicyEngine implements PolicyEngine {
  async evaluate(_input: PolicyInput): Promise<PolicyDecision> {
    throw new Error("Policy Engine unavailable");
  }
}
