import { SeedEvent } from "../events/types/events.types";
import { DataProvider } from "../seed";
import { SeedUser } from "../users/types/users.types";
import { EventPaymentSeed } from "./events/event.payments.seed";
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
    
        return { payments };
    }

}