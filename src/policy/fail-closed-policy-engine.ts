import type {PolicyEngine} from "../interfaces/policy-engine.ts";
import {isPolicyDecision} from "./pure-policy-engine.ts";
import type {PolicyDecision, PolicyInput} from "./types.ts";

export class FailClosedPolicyEngine implements PolicyEngine {
  readonly #delegate: PolicyEngine;

  constructor(delegate: PolicyEngine) {
    this.#delegate = delegate;
  }

  async evaluate(input: PolicyInput): Promise<PolicyDecision> {
    try {
      const decision = await this.#delegate.evaluate(input);
      if (!isPolicyDecision(decision)) {
        return {
          result: "INDETERMINATE",
          reasonCode: "POLICY_ENGINE_UNAVAILABLE"
        };
      }
      return decision;
    } catch {
      return {
        result: "INDETERMINATE",
        reasonCode: "POLICY_ENGINE_UNAVAILABLE"
      };
    }
  }
}
