import type {ModelToolRequest} from "../api/model-tools.ts";
import type {OperationContext} from "../domain/control-plane.ts";
import type {ProfileId} from "../domain/ids.ts";

export interface ModelGatewayRequest extends OperationContext {
  readonly modelProfileId: ProfileId;
  readonly contextReferenceIds: readonly string[];
}

export interface ModelGatewayResponse {
  readonly engagementId: ModelGatewayRequest["engagementId"];
  readonly status: "proposed";
  readonly toolRequest: ModelToolRequest;
}

export interface ModelGateway {
  propose(input: ModelGatewayRequest): Promise<ModelGatewayResponse>;
}
