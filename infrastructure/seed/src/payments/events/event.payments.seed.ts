import { SeedEvent } from "../../events/types/events.types";
import { insertEvent } from "./services/event.payment.service";
import { DataProvider } from "../../seed";
import { filterEvent } from "./events.payments.seed.mapper";
import { EventPaymentSeedResult, EventPaymentToInsert, SeedEventPayment } from "./types/event.payment.types";

export class EventPaymentSeed implements DataProvider<EventPaymentSeedResult> {
    private events: SeedEvent[];

    constructor(events: SeedEvent[]) {
        this.events = events;
    }

    async populate(): Promise<EventPaymentSeedResult> {
        const eventsToInsert: EventPaymentToInsert[] = filterEvent(this.events);
        const eventPayments: SeedEventPayment[] = [];

        for (const event of eventsToInsert) {
            const e = await insertEvent(event);
            eventPayments.push(e);
        }

        return { eventPayments: eventPayments };
    }

}