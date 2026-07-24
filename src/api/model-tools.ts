import type {
  EngagementId,
  ExecutionId,
  FindingId,
  PatchId,
  PocId,
  ProfileId,
  RepositoryId,
  ScenarioId,
  TargetId,
  TestCaseId,
  TestSuiteId
} from "../domain/ids.ts";

export type ModelToolName =
  | "get_engagement"
  | "get_authorized_targets"
  | "get_allowed_test_cases"
  | "run_static_analysis"
  | "run_safe_network_discovery"
  | "run_web_test"
  | "request_poc_validation"
  | "collect_evidence"
  | "propose_patch"
  | "validate_patch"
  | "reset_range"
  | "terminate_engagement";

export type ModelToolRequest =
  | Readonly<{tool: "get_engagement"}>
  | Readonly<{tool: "get_authorized_targets"}>
  | Readonly<{tool: "get_allowed_test_cases"; targetId?: TargetId}>
  | Readonly<{
      tool: "run_static_analysis";
      repositoryId: RepositoryId;
      profileId: ProfileId;
    }>
  | Readonly<{
      tool: "run_safe_network_discovery";
      targetId: TargetId;
      profileId: ProfileId;
    }>
  | Readonly<{
      tool: "run_web_test";
      targetId: TargetId;
      testCaseId: TestCaseId;
    }>
  | Readonly<{
      tool: "request_poc_validation";
      targetId: TargetId;
      pocId: PocId;
    }>
  | Readonly<{tool: "collect_evidence"; executionId: ExecutionId}>
  | Readonly<{tool: "propose_patch"; findingId: FindingId}>
  | Readonly<{
      tool: "validate_patch";
      patchId: PatchId;
      testSuiteId: TestSuiteId;
    }>
  | Readonly<{tool: "reset_range"; scenarioId: ScenarioId}>
  | Readonly<{tool: "terminate_engagement"; engagementId: EngagementId}>;

export interface ToolResponseEnvelope {
  readonly status:
    | "denied"
    | "waiting-approval"
    | "stopped"
    | "not-implemented";
  readonly reasonCode: string;
  readonly policyResult:
    | "PERMIT"
    | "REQUIRE_APPROVAL"
    | "DENY"
    | "INDETERMINATE"
    | "TERMINATE";
}
