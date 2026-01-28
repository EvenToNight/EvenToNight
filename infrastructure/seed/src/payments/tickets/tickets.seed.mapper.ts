import { SeedEvent } from "../../events/types/events.types";
import { SeedUser } from "../../users/types/users.types";
import { SeedTicketType } from "../event-ticket-types.ts/types/tickets-type.types";
import { ticketSeedData } from "./data/ticket.data";
import { TicketToCreate } from "./types/ticket.types";


export function filterTicket(users: SeedUser[], events: SeedEvent[], ticketTypes: SeedTicketType[]): TicketToCreate[] {
    const userIdMap: Record<string, string> = {};
    for (const user of users) {
        userIdMap[user.username] = user.id;
    }

    const eventIdMap: Record<string, string> = {};
    for (const event of events) {
        eventIdMap[event.title] = event._id;
    }

    const ticketTypeIdMap: Record<string, string> = {};
    for (const ticketType of ticketTypes) {
        ticketTypeIdMap[ticketType.eventId] = ticketType._id.toString();
    }

    const filteredTicketSeedData = ticketSeedData
        .filter(ticket => ticket.user in userIdMap && ticket.event in eventIdMap)
        .map(ticket => ({
            userId: userIdMap[ticket.user],
            eventId: eventIdMap[ticket.event],
            attendeeName: ticket.attendeeName,
            ticketType: eventIdMap[ticket.ticketType],
        }));
    
    const ticketsToCreate: TicketToCreate[] = filteredTicketSeedData.map(ticket => ({
        userId: ticket.userId,
        eventId: ticket.eventId,
        attendeeName: ticket.attendeeName,
        ticketType: ticketTypeIdMap[ticket.ticketType],
    }));
    
    return ticketsToCreate;
}

    