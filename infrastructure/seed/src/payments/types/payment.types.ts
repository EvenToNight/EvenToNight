import { EventPaymentSeedResult } from "../events/types/event.payment.types";

export type SeedPayment = EventPaymentSeedResult

export interface PaymentSeedResult {
    payments: SeedPayment[];
}