import { TicketTypeSeedResult } from "../event-ticket-types.ts/types/tickets-type.types";
import { EventPaymentSeedResult } from "../events/types/event.payment.types";
import { OrderSeedResult } from "../orders/types/order.types";
import { TicketSeedResult } from "../tickets/types/ticket.types";

export type SeedPayment = EventPaymentSeedResult | TicketTypeSeedResult | TicketSeedResult | OrderSeedResult

export interface PaymentSeedResult {
    payments: SeedPayment[];
}