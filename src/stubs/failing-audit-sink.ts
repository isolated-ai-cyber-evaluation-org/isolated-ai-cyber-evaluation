import type {
  AppendOnlyAuditEvent,
  AppendOnlyAuditSink
} from "../interfaces/audit-sink.ts";

export class FailingAppendOnlyAuditSink implements AppendOnlyAuditSink {
  async append(_event: AppendOnlyAuditEvent): Promise<void> {
    throw new Error("Synthetic audit append failure");
  }
}
