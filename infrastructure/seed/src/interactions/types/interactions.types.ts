import { EventInteractionSeedResult } from "../events/types/event.interaction.types";
import { FollowSeedResult } from "../follows/types/follow.types";
import { LikeSeedResult } from "../likes/types/like.types";

export type SeedInteraction = EventInteractionSeedResult | FollowSeedResult | LikeSeedResult

export interface InteractionSeedResult {
  interactions: SeedInteraction[];
}