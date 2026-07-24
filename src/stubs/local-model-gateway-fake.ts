import {ControlPlaneError} from "../domain/control-plane.ts";
import type {EngagementId} from "../domain/ids.ts";
import type {AppendOnlyAuditSink} from "../interfaces/audit-sink.ts";
import type {
  ModelGateway,
  ModelGatewayRequest,
  ModelGatewayResponse
} from "../interfaces/model-gateway.ts";
import type {ScopeService} from "../interfaces/scope-service.ts";
import type {ModelToolRequest} from "../api/model-tools.ts";
import {AuditEventFactory} from "../services/audit-event-factory.ts";

export interface ModelProposalFixture {
  readonly engagementId: EngagementId;
  readonly toolRequest: ModelToolRequest;
}

export class LocalModelGatewayFake implements ModelGateway {
  readonly #scopeService: ScopeService;
  readonly #auditSink: AppendOnlyAuditSink;
  readonly #auditFactory: AuditEventFactory;
  readonly #proposals: ReadonlyMap<EngagementId, ModelToolRequest>;

  constructor(
    scopeService: ScopeService,
    auditSink: AppendOnlyAuditSink,
    auditFactory: AuditEventFactory,
    proposals: readonly ModelProposalFixture[]
  ) {
    this.#scopeService = scopeService;
    this.#auditSink = auditSink;
    this.#auditFactory = auditFactory;
    this.#proposals = new Map(
      proposals.map((item) => [item.engagementId, item.toolRequest])
    );
  }

  async propose(input: ModelGatewayRequest): Promise<ModelGatewayResponse> {
    try {
      await this.#auditSink.append(this.#auditFactory.create({
        ...input,
        eventType: "MODEL_PROPOSAL_ATTEMPT"
      }));
    } catch {
      throw new ControlPlaneError("AUDIT_APPEND_FAILED");
    }
    const scope = await this.#scopeService.getScope(input.engagementId);
    if (
      scope === undefined
      || !scope.authorizedProfileIds.includes(input.modelProfileId)
    ) {
      throw new ControlPlaneError("MODEL_PROFILE_NOT_ALLOWED");
    }
    const toolRequest = this.#proposals.get(input.engagementId);
    if (toolRequest === undefined) {
      throw new ControlPlaneError("DEPENDENCY_UNHEALTHY");
    }
    return Object.freeze({
      engagementId: input.engagementId,
      status: "proposed",
      toolRequest
    });
  }
}
