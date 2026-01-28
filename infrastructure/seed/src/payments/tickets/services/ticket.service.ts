import { SeedTicket, TicketToCreate } from "../types/ticket.types";
import { ObjectId } from "mongodb";
import { execSync } from "child_process";

export async function createTicket(ticketData: TicketToCreate): Promise<SeedTicket> {
    const _id = new ObjectId();
    const now = new Date();

    const DOCKER_CONTAINER = 
        process.env.PAYMENT_MONGO_URI || "eventonight-mongo-payments-1";
    const MONGO_DB = "eventonight-payments";

    const ticketToCreate: SeedTicket = {
        _id,
        ...ticketData,
        purchasedDate: now,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
    };

    const insertCommand = `db.tickets.insertOne(${JSON.stringify(ticketToCreate)})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Ticket inserted: ${_id}`);
        return ticketToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert ticket ${_id}: ${errorMessage}`);
    }
}
