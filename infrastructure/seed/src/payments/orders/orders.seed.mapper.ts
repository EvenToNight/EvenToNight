import { SeedTicket } from "../tickets/types/ticket.types";
import { OrderToCreate } from "./types/order.types";

export function filterOrder(tickets: SeedTicket[]): OrderToCreate[] {

    const ordersToCreate: OrderToCreate[] = [];

    for (const ticket of tickets) {
        ordersToCreate.push({
            userId: ticket.userId,
            eventId: ticket.eventId,
            ticketIds: [ticket._id.toHexString()],
        });
    }
    return ordersToCreate;
}
