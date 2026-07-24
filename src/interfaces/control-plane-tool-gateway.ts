import type {
  ToolResponseEnvelope
} from "../api/model-tools.ts";
import type {AuthorizationAttempt} from "./policy-engine-adapter.ts";

export interface ControlPlaneToolGateway {
  request(input: AuthorizationAttempt): Promise<ToolResponseEnvelope>;
}
