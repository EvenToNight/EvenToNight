import { SeedEvent } from "../../events/types/events.types";
import { DataProvider } from "../../seed";
import { SeedUser } from "../../users/types/users.types";
import { SeedTicketType } from "../event-ticket-types.ts/types/tickets-type.types";
import { filterTicket } from "./tickets.seed.mapper";
import { SeedTicket, TicketSeedResult } from "./types/ticket.types";
import { createTicket } from "./services/ticket.service";

export class TicketSeed implements DataProvider<TicketSeedResult> {
    private events: SeedEvent[];
    private users: SeedUser[];
    private ticketTypes: SeedTicketType[];

    constructor(events: SeedEvent[], users: SeedUser[], ticketTypes: SeedTicketType[]) {
        this.events = events;
        this.users = users;
        this.ticketTypes = ticketTypes;
    }

    async populate(): Promise<TicketSeedResult> {
        const ticketsToCreate = filterTicket(this.users, this.events, this.ticketTypes);
        const tickets: SeedTicket[] = [];

        console.log(`Starting creating tickets...`);
        
        for (const ticket of ticketsToCreate) {
            const t = await createTicket(ticket);
            tickets.push(t);
        }

        return { tickets };
    }

}