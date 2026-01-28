import { TicketTypeSeedResult } from "../event-ticket-types.ts/types/tickets-type.types";
import { EventPaymentSeedResult } from "../events/types/event.payment.types";

export type SeedPayment = EventPaymentSeedResult | TicketTypeSeedResult

export interface PaymentSeedResult {
    payments: SeedPayment[];
}