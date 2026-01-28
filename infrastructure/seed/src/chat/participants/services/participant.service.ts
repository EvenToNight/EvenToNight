import { SeedParticipant, ParticipantToInsert } from "../types/participant.types";
import { execSync } from "child_process";
import { ObjectId } from "mongodb";

export async function insertParticipant(participant: ParticipantToInsert): Promise<SeedParticipant> {

    const _id = new ObjectId();
    
    const DOCKER_CONTAINER =
        process.env.CHAT_MONGO_URI || "eventonight-mongo-chat-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const now = new Date().toISOString();
    const participantToInsert: SeedParticipant = {
        _id,
        ...participant,
        unreadCount: 0,
        lastReadAt: now,
        __v: 0,
    };

    const insertCommand = `db.participants.insertOne({
        _id: ObjectId('${_id.toString()}'),
        conversationId: ObjectId('${participant.conversationId.toString()}'),
        userId: '${participant.userId}',
        userName: '${participant.userName.replace(/'/g, "\\'")}',
        role: '${participant.role}',
        unreadCount: 0,
        lastReadAt: ISODate('${now}'),
        __v: 0
    })`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval "${insertCommand}"`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Participant inserted: ${_id}`);

        return participantToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert participant ${_id}: ${errorMessage}`);
    }

}