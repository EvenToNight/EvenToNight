import { EventInteractionSeedResult } from "../events/types/event.interaction.types";

export type SeedInteraction = EventInteractionSeedResult

export interface InteractionSeedResult {
  interactions: SeedInteraction[];
}