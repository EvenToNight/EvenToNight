import { EventInteractionSeedResult } from "../events/types/event.interaction.types";
import { FollowSeedResult } from "../follows/types/follow.types";
import { LikeSeedResult } from "../likes/types/like.types";
import { ParticipationSeedResult } from "../participations/types/participation.types";
import { ReviewSeedResult } from "../reviews/types/review.types";

export type SeedInteraction = EventInteractionSeedResult | FollowSeedResult | LikeSeedResult | ParticipationSeedResult | ReviewSeedResult;

export interface InteractionSeedResult {
  interactions: SeedInteraction[];
}