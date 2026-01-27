import { EventInteractionSeedResult } from "../events/types/event.interaction.types";
import { FollowSeedResult } from "../follows/types/follow.types";

export type SeedInteraction = EventInteractionSeedResult | FollowSeedResult

export interface InteractionSeedResult {
  interactions: SeedInteraction[];
}