import { EventPaymentToInsert, SeedEventPayment } from "../types/event.payment.types";
import { execSync } from "child_process";
import { buildMongoConnectionString } from "../../../utils/mongo-connection.utils";

export async function insertEvent(event: EventPaymentToInsert): Promise<SeedEventPayment> {

    const DOCKER_CONTAINER =
        process.env.PAYMENT_MONGO_URI || "eventonight-mongo-payments-1";
    const MONGO_DB = "eventonight-payments";

    const eventPaymentToInsert: SeedEventPayment = {
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const insertCommand = `db.events.insertOne(${JSON.stringify(eventPaymentToInsert)})`;

    try {
        const connectionString = buildMongoConnectionString(DOCKER_CONTAINER, MONGO_DB);

        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh "${connectionString}" --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Event Payment inserted: ${event._id}`);

        return eventPaymentToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert event payment ${event._id}: ${errorMessage}`);
    }

}