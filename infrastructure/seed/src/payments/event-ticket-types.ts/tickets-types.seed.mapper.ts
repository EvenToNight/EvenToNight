import { SeedEvent } from "../../events/types/events.types";
import { ticketTypeSeedData } from "./data/ticket-types.data";
import { TicketTypeToCreate } from "./types/tickets-type.types";


export function filterTicketTypes(events: SeedEvent[]): TicketTypeToCreate[] {
    const eventIdMap: Record<string, string> = {};
    for (const event of events) {
        eventIdMap[event.title] = event._id;
    }

    const ticketTypesToCreate: TicketTypeToCreate[] = ticketTypeSeedData
        .filter(ticketType => ticketType.event in eventIdMap)
        .map(ticketType => ({
            eventId: eventIdMap[ticketType.event],
            type: ticketType.type,
            price: ticketType.price,
            availableQuantity: ticketType.availableQuantity,
            soldQuantity: ticketType.soldQuantity,
        }));

    return ticketTypesToCreate;
}