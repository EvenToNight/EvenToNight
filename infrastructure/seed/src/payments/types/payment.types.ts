import { TicketTypeSeedResult } from "../event-ticket-types.ts/types/tickets-type.types";
import { EventPaymentSeedResult } from "../events/types/event.payment.types";
import { TicketSeedResult } from "../tickets/types/ticket.types";

export type SeedPayment = EventPaymentSeedResult | TicketTypeSeedResult | TicketSeedResult

export interface PaymentSeedResult {
    payments: SeedPayment[];
}