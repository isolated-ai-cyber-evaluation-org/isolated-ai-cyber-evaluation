import type {EngagementId} from "../domain/ids.ts";
import type {
  EngagementSnapshot,
  RulesOfEngagementSnapshot,
  ScopeCatalog
} from "../domain/manifests.ts";

export interface ScopeService {
  getEngagement(id: EngagementId): Promise<EngagementSnapshot | undefined>;
  getScope(id: EngagementId): Promise<ScopeCatalog | undefined>;
  getRulesOfEngagement(
    id: EngagementId
  ): Promise<RulesOfEngagementSnapshot | undefined>;
}
