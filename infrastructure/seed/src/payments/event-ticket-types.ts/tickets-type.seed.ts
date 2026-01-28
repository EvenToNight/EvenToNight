import { SeedEvent } from "../../events/types/events.types";
import { DataProvider } from "../../seed";
import { filterTicketTypes } from "./tickets-types.seed.mapper";
import { SeedTicketType, TicketTypeSeedResult } from "./types/tickets-type.types";
import { createTicketType } from "./services/ticket-type.service";

export class TicketTypeSeed implements DataProvider<TicketTypeSeedResult> {
    private events: SeedEvent[];

    constructor(events: SeedEvent[]) {
        this.events = events;
    }

    async populate(): Promise<TicketTypeSeedResult> {
        const ticketTypesToCreate = filterTicketTypes(this.events);
        const ticketTypes: SeedTicketType[] = [];
        
        console.log(`Starting creating ticket types...`);

        for (const ticketType of ticketTypesToCreate) {
            const tt = await createTicketType(ticketType);
            ticketTypes.push(tt);
        }
        
        return { ticketTypes };
    }

}