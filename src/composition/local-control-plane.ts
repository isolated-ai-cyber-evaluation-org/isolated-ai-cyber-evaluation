import type {BoundApproval} from "../domain/approval.ts";
import type {
  EngagementSnapshot,
  RulesOfEngagementSnapshot,
  ScopeCatalog
} from "../domain/manifests.ts";
import type {AppendOnlyAuditSink} from "../interfaces/audit-sink.ts";
import type {PolicyEngine} from "../interfaces/policy-engine.ts";
import type {PolicyDependencies} from "../policy/types.ts";
import {PurePolicyEngine} from "../policy/pure-policy-engine.ts";
import {AuditEventFactory} from "../services/audit-event-factory.ts";
import {LocalApprovalService} from "../services/local-approval-service.ts";
import {LocalEmergencyStopService} from "../services/local-emergency-stop-service.ts";
import {LocalEngagementService} from "../services/local-engagement-service.ts";
import {LocalPolicyEngineAdapter} from "../services/local-policy-engine-adapter.ts";
import {InMemoryAppendOnlyAuditSink} from "../stubs/in-memory-audit-sink.ts";
import {InMemoryScopeService} from "../stubs/in-memory-scope-service.ts";
import {
  LocalModelGatewayFake,
  type ModelProposalFixture
} from "../stubs/local-model-gateway-fake.ts";
import {LocalToolGatewayMock} from "../stubs/local-tool-gateway-mock.ts";
import {LocalCredentialBrokerMock} from "../stubs/local-credential-broker-mock.ts";
import type {EngagementRuntimeRecord} from "../interfaces/engagement-service.ts";

export interface LocalControlPlaneInput {
  readonly engagements: readonly EngagementSnapshot[];
  readonly scopes: readonly ScopeCatalog[];
  readonly rulesOfEngagement: readonly RulesOfEngagementSnapshot[];
  readonly runtimeRecords: readonly EngagementRuntimeRecord[];
  readonly approvals?: readonly BoundApproval[];
  readonly modelProposals?: readonly ModelProposalFixture[];
  readonly auditSink?: AppendOnlyAuditSink;
  readonly policyEngine?: PolicyEngine;
  readonly policyDependencies?: PolicyDependencies;
}

export function composeLocalControlPlane(input: LocalControlPlaneInput) {
  const auditSink = input.auditSink ?? new InMemoryAppendOnlyAuditSink();
  const auditFactory = new AuditEventFactory();
  const scopeService = new InMemoryScopeService(
    input.engagements,
    input.scopes,
    input.rulesOfEngagement
  );
  const approvalService = new LocalApprovalService(
    auditSink,
    auditFactory,
    input.approvals ?? []
  );
  const emergencyStop = new LocalEmergencyStopService(
    auditSink,
    auditFactory
  );
  const policyAdapter = new LocalPolicyEngineAdapter(
    scopeService,
    approvalService,
    emergencyStop,
    input.policyEngine ?? new PurePolicyEngine(),
    input.policyDependencies
  );
  const engagementService = new LocalEngagementService(
    scopeService,
    approvalService,
    emergencyStop,
    auditSink,
    auditFactory,
    input.runtimeRecords
  );
  const modelGateway = new LocalModelGatewayFake(
    scopeService,
    auditSink,
    auditFactory,
    input.modelProposals ?? []
  );
  const toolGateway = new LocalToolGatewayMock(
    policyAdapter,
    auditSink,
    auditFactory
  );
  const credentialBroker = new LocalCredentialBrokerMock(
    scopeService,
    approvalService,
    emergencyStop,
    auditSink,
    auditFactory
  );

  return Object.freeze({
    approvalService,
    auditSink,
    credentialBroker,
    emergencyStop,
    engagementService,
    modelGateway,
    policyAdapter,
    scopeService,
    toolGateway
  });
}
