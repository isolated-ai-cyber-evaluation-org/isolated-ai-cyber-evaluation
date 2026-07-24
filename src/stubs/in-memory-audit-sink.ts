import type {
  AppendOnlyAuditEvent,
  AppendOnlyAuditSink
} from "../interfaces/audit-sink.ts";

export class InMemoryAppendOnlyAuditSink implements AppendOnlyAuditSink {
  readonly #events: AppendOnlyAuditEvent[] = [];

  async append(event: AppendOnlyAuditEvent): Promise<void> {
    this.#events.push(Object.freeze({...event}));
  }

  snapshot(): readonly AppendOnlyAuditEvent[] {
    return Object.freeze(this.#events.map((event) => Object.freeze({...event})));
  }
}
