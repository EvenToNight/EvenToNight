import { SeedEvent } from "../events/types/events.types";
import { DataProvider } from "../seed";
import { SeedUser } from "../users/types/users.types";
import { TicketTypeSeed } from "./event-ticket-types.ts/tickets-type.seed";
import { EventPaymentSeed } from "./events/event.payments.seed";
import { OrderSeed } from "./orders/order.seed";
import { TicketSeed } from "./tickets/ticket.seed";
import { PaymentSeedResult, SeedPayment } from "./types/payment.types";

export class PaymentSeed implements DataProvider<PaymentSeedResult> {
    private users: SeedUser[];
    private events: SeedEvent[];

    constructor(users: SeedUser[], events: SeedEvent[]) {
        this.users = users;
        this.events = events;
    }

    async populate(): Promise<PaymentSeedResult> {
        const payments: SeedPayment[] = [];

        payments.push(
            await new EventPaymentSeed(this.events).populate()
        );

        let ticketTypes = []
        payments.push(
            { ticketTypes } = await new TicketTypeSeed(this.events).populate()
        )

        let tickets = []
        payments.push(
            { tickets } = await new TicketSeed(this.events, this.users, ticketTypes).populate()
        )

        payments.push(
            await new OrderSeed(tickets).populate()
        )
    
        return { payments };
    }

}