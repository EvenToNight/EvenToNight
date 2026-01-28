import { EventInteractionToInsert } from "./types/event.interaction.types";
import { SeedEvent } from "../../events/types/events.types";

export function filterEvent(events: SeedEvent[]): EventInteractionToInsert[] {
    const eventInteractions: EventInteractionToInsert[] = [];
    for (const event of events) {
        eventInteractions.push({
            eventId: event._id,
            creatorId: event.creatorId,
            collaboratorIds: event.collaboratorsIds,
            name: event.title,
            status: event.status
        });
    }
    
    return eventInteractions;
}