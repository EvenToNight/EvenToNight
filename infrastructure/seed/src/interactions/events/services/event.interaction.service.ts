import { EventInteractionToInsert } from "../types/event.interaction.types";
import { SeedEventInteraction } from "../types/event.interaction.types";
import crypto from "crypto";
import { execSync } from "child_process";

export async function insertEvent(event: EventInteractionToInsert): Promise<SeedEventInteraction> {

    const _id = crypto.randomUUID();

    const DOCKER_CONTAINER =
        process.env.INTERACTIONS_MONGO_URI || "eventonight-mongo-interactions-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const eventInteractionToInsert = {
        _id,
        ...event,
    };

    const insertCommand = `db.events.insertOne(${JSON.stringify(eventInteractionToInsert)})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Event Interaction inserted: ${_id}`);

        return eventInteractionToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert event interaction ${_id}: ${errorMessage}`);
    }


}