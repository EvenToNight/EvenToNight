import { SeedParticipant, ParticipantToInsert } from "../types/participant.types";
import { execSync } from "child_process";
import crypto from "crypto";

export async function insertParticipant(participant: ParticipantToInsert): Promise<SeedParticipant> {

    const _id = crypto.randomUUID();
    
    const DOCKER_CONTAINER =
        process.env.CHAT_MONGO_URI || "eventonight-mongo-chat-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const participantToInsert: SeedParticipant = {
        _id,
        ...participant,
        unreadCount: 0,
        lastReadAt: new Date().toISOString(),
        __v: 0,
    };

    const insertCommand = `db.participants.insertOne(${JSON.stringify(participantToInsert)})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Participant inserted: ${_id}`);

        return participantToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert participant ${_id}: ${errorMessage}`);
    }

}