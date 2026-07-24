import type {PolicyEngine} from "../interfaces/policy-engine.ts";
import type {
  AuthorizationAttempt,
  PolicyEngineAdapter
} from "../interfaces/policy-engine-adapter.ts";
import type {ScopeService} from "../interfaces/scope-service.ts";
import type {ApprovalService} from "../interfaces/approval-service.ts";
import type {EmergencyStop} from "../interfaces/emergency-stop.ts";
import {FailClosedPolicyEngine} from "../policy/fail-closed-policy-engine.ts";
import type {
  PolicyDecision,
  PolicyDependencies
} from "../policy/types.ts";

const healthyDependencies: PolicyDependencies = {
  scopeServiceHealthy: true,
  approvalServiceHealthy: true,
  policyBundleHealthy: true,
  monitoringHealthy: true
};

export class LocalPolicyEngineAdapter implements PolicyEngineAdapter {
  readonly #scopeService: ScopeService;
  readonly #approvalService: ApprovalService;
  readonly #emergencyStop: EmergencyStop;
  readonly #policyEngine: PolicyEngine;
  readonly #dependencies: PolicyDependencies;

  constructor(
    scopeService: ScopeService,
    approvalService: ApprovalService,
    emergencyStop: EmergencyStop,
    policyEngine: PolicyEngine,
    dependencies: PolicyDependencies = healthyDependencies
  ) {
    this.#scopeService = scopeService;
    this.#approvalService = approvalService;
    this.#emergencyStop = emergencyStop;
    this.#policyEngine = new FailClosedPolicyEngine(policyEngine);
    this.#dependencies = dependencies;
  }

  async authorize(input: AuthorizationAttempt): Promise<PolicyDecision> {
    let engagement;
    let scope;
    let rulesOfEngagement;
    let approval;
    try {
      [engagement, scope, rulesOfEngagement, approval] = await Promise.all([
        this.#scopeService.getEngagement(input.engagementId),
        this.#scopeService.getScope(input.engagementId),
        this.#scopeService.getRulesOfEngagement(input.engagementId),
        input.approvalId === undefined
          ? Promise.resolve(undefined)
          : this.#approvalService.getApproval(input.approvalId)
      ]);
    } catch {
      return {result: "INDETERMINATE", reasonCode: "DEPENDENCY_UNHEALTHY"};
    }

    if (
      engagement === undefined
      || scope === undefined
      || rulesOfEngagement === undefined
    ) {
      return {result: "INDETERMINATE", reasonCode: "DEPENDENCY_UNHEALTHY"};
    }

    if (
      scope.engagementId !== engagement.id
      || scope.scopeGeneration !== engagement.generation
      || rulesOfEngagement.engagementId !== engagement.id
      || rulesOfEngagement.id !== engagement.rulesOfEngagementId
    ) {
      return {result: "DENY", reasonCode: "AUTHORIZATION_MISMATCH"};
    }

    return this.#policyEngine.evaluate({
      engagementId: input.engagementId,
      scope,
      nowEpochMs: input.nowEpochMs,
      engagementValidFromEpochMs: Math.max(
        engagement.validFromEpochMs,
        rulesOfEngagement.validFromEpochMs
      ),
      engagementValidUntilEpochMs: Math.min(
        engagement.validUntilEpochMs,
        rulesOfEngagement.validUntilEpochMs
      ),
      schemaValid: true,
      signaturesValid: true,
      argumentsValidated: true,
      policyDigestMatches: true,
      actionClass: input.actionClass,
      actionDigest: input.actionDigest,
      requesterId: input.actorId,
      ...(approval === undefined ? {} : {approval}),
      budgetState: "within-limits",
      stopActive: this.#emergencyStop.isBlocked(input.engagementId),
      dependencies: this.#dependencies,
      request: input.request
    });
  }
}
