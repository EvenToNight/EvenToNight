import { TicketTypeToCreate, SeedTicketType } from "../types/tickets-type.types.js";
import { ObjectId } from "mongodb";
import { execSync } from "child_process";

export async function createTicketType(ticketTypeData: TicketTypeToCreate): Promise<SeedTicketType> {
    const _id = new ObjectId();
    const now = new Date();

    const DOCKER_CONTAINER = 
        process.env.PAYMENT_MONGO_URI || "eventonight-mongo-payments-1";
    const MONGO_DB = "eventonight-payments";

    const ticketTypeToCreate: SeedTicketType = {
        _id,
        ...ticketTypeData,
        createdAt: now,
        updatedAt: now,
    };

    const insertCommand = `db.event_ticket_types.insertOne(${JSON.stringify(ticketTypeToCreate)})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Ticket Type inserted: ${_id}`);

        return ticketTypeToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert ticket type ${_id}: ${errorMessage}`);
    }
}
    