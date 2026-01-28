import { DataProvider } from "../../seed";
import { SeedTicket } from "../tickets/types/ticket.types";
import { OrderSeedResult } from "./types/order.types";
import { filterOrder } from "./orders.seed.mapper";
import { createOrder } from "./services/order.service";

export class OrderSeed implements DataProvider<OrderSeedResult> {
    private tickets: SeedTicket[];

    constructor(tickets: SeedTicket[]) {
        this.tickets = tickets;
    }

    async populate(): Promise<OrderSeedResult> {
        const ordersToCreate = filterOrder(this.tickets)
        const orders = [];
        
        console.log(`Starting creating orders...`);
        for (const order of ordersToCreate) {
            const o = await createOrder(order);
            orders.push(o);
        }
        
        return { orders };
    }

}

