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

        await insertEventPrice(ticketTypeToCreate);

        return ticketTypeToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert ticket type ${_id}: ${errorMessage}`);
    }
}

export async function insertEventPrice(ticketType: SeedTicketType): Promise<void> {
    const _id = new ObjectId();
    const DOCKER_CONTAINER = 
        process.env.EVENT_MONGO_URI || "eventonight-mongo-events-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const eventPriceToCreate = {
        _id,
        eventId: ticketType.eventId,
        ticketTypeId: ticketType._id.toString(),
        price: ticketType.price.amount,
    };

    const insertCommand = `db.prices.insertOne(${JSON.stringify(eventPriceToCreate)})`;
    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Event Price inserted for events: ${ticketType.eventId}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert event price for ticket type ${ticketType._id}: ${errorMessage}`);
    }
}