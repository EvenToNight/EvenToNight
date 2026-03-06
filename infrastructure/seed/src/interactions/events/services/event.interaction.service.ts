import { EventInteractionToInsert } from "../types/event.interaction.types";
import { SeedEventInteraction } from "../types/event.interaction.types";
import crypto from "crypto";
import { execSync } from "child_process";

export async function insertEvent(event: EventInteractionToInsert): Promise<SeedEventInteraction> {

    const _id = crypto.randomUUID();

    const MONGO_HOST =
        process.env.INTERACTION_MONGO_URI || "mongo-interactions";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const eventInteractionToInsert = {
        _id,
        ...event,
    };

    const insertCommand = `db.events.insertOne(${JSON.stringify(eventInteractionToInsert)})`;

    try {
        execSync(
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Event Interaction inserted: ${_id}`);

        return eventInteractionToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert event interaction ${_id}: ${errorMessage}`);
    }


}