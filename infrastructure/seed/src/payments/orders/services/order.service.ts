import { execSync } from "child_process";
import { SeedOrder } from "../types/order.types";
import { OrderToCreate } from "../types/order.types";
import crypto from "crypto";

export async function createOrder(orderData: OrderToCreate): Promise<SeedOrder> {
    const _id = crypto.randomUUID();
    const now = new Date();

    const DOCKER_CONTAINER = 
        process.env.PAYMENT_MONGO_URI || "eventonight-mongo-payments-1";
    const MONGO_DB = "eventonight-payments";

    const orderToCreate: SeedOrder = {
        _id,
        ...orderData,
        status: "COMPLETED",
        createdAt: now,
        updatedAt: now,
    };

    // Converti in JSON e sostituisci con sintassi MongoDB
    let jsonDoc = JSON.stringify(orderToCreate)
        .replace(/"createdAt":"([^"]+)"/g, '"createdAt":ISODate("$1")')
        .replace(/"updatedAt":"([^"]+)"/g, '"updatedAt":ISODate("$1")')

    const insertCommand = `db.orders.insertOne(${jsonDoc})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Order inserted: ${_id}`);
        return orderToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert order ${_id}: ${errorMessage}`);
    }

}