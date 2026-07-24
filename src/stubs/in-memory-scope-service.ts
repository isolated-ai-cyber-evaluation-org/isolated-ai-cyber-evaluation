import type {EngagementId} from "../domain/ids.ts";
import type {
  EngagementSnapshot,
  RulesOfEngagementSnapshot,
  ScopeCatalog
} from "../domain/manifests.ts";
import type {ScopeService} from "../interfaces/scope-service.ts";

export class InMemoryScopeService implements ScopeService {
  readonly #engagements: ReadonlyMap<EngagementId, EngagementSnapshot>;
  readonly #scopes: ReadonlyMap<EngagementId, ScopeCatalog>;
  readonly #rulesOfEngagement: ReadonlyMap<
    EngagementId,
    RulesOfEngagementSnapshot
  >;

  constructor(
    engagements: readonly EngagementSnapshot[],
    scopes: readonly ScopeCatalog[],
    rulesOfEngagement: readonly RulesOfEngagementSnapshot[] = []
  ) {
    this.#engagements = new Map(engagements.map((item) => [item.id, item]));
    this.#scopes = new Map(scopes.map((item) => [item.engagementId, item]));
    this.#rulesOfEngagement = new Map(
      rulesOfEngagement.map((item) => [item.engagementId, item])
    );
  }

  async getEngagement(
    id: EngagementId
  ): Promise<EngagementSnapshot | undefined> {
    return this.#engagements.get(id);
  }

  async getScope(id: EngagementId): Promise<ScopeCatalog | undefined> {
    return this.#scopes.get(id);
  }

  async getRulesOfEngagement(
    id: EngagementId
  ): Promise<RulesOfEngagementSnapshot | undefined> {
    return this.#rulesOfEngagement.get(id);
  }
}
