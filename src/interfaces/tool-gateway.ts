import type {
  ModelToolRequest,
  ToolResponseEnvelope
} from "../api/model-tools.ts";
import type {PolicyInputContext} from "../policy/types.ts";

export interface ToolGateway {
  request(
    toolRequest: ModelToolRequest,
    context: PolicyInputContext
  ): Promise<ToolResponseEnvelope>;
}
