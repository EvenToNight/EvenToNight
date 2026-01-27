import { EventStatus } from "../schemas/event.interaction.schema";

export interface EventInteractionToInsert {
    eventId: string;
    collaboratorIds?: string[];
    creatorId: string;
    name?: string;
    status?: EventStatus;
}

export type SeedEventInteraction = EventInteractionToInsert & {
    _id: string;
};

export interface EventInteractionSeedResult {
    eventInteractions: SeedEventInteraction[];
}