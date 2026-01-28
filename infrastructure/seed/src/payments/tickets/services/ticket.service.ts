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
        purchaseDate: now,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
    };

    // Converti in JSON e sostituisci con sintassi MongoDB
    let jsonDoc = JSON.stringify(ticketToCreate)
        .replace(/"_id":\{"\$oid":"([^"]+)"\}/g, '"_id":"$1"')
        .replace(/"purchaseDate":"([^"]+)"/g, '"purchaseDate":ISODate("$1")')
        .replace(/"createdAt":"([^"]+)"/g, '"createdAt":ISODate("$1")')
        .replace(/"updatedAt":"([^"]+)"/g, '"updatedAt":ISODate("$1")')
        .replace(/("price":\{[^}]*"_id":)"([0-9a-f]{24})"/g, '$1ObjectId("$2")');

    const insertCommand = `db.tickets.insertOne(${jsonDoc})`;

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
