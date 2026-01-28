import { EventPaymentToInsert } from "./types/event.payment.types";
import { SeedEvent } from "../../events/types/events.types";

export function filterEvent(events: SeedEvent[]): EventPaymentToInsert[] {
    const eventPayments: EventPaymentToInsert[] = [];
    for (const event of events) {
        eventPayments.push({
            _id: event._id,
            creatorId: event.creatorId,
            title: event.title,
            date: event.date,
            status: event.status
        });
    }
    return eventPayments;
}