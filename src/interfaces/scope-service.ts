import type {EngagementId} from "../domain/ids.ts";
import type {EngagementSnapshot, ScopeCatalog} from "../domain/manifests.ts";

export interface ScopeService {
  getEngagement(id: EngagementId): Promise<EngagementSnapshot | undefined>;
  getScope(id: EngagementId): Promise<ScopeCatalog | undefined>;
}
