import { SeedParticipant, ParticipantToInsert } from "../types/participant.types";
import { execSync } from "child_process";
import { ObjectId } from "mongodb";

export async function insertParticipant(participant: ParticipantToInsert): Promise<SeedParticipant> {

    const _id = new ObjectId();

    const MONGO_HOST =
        process.env.CHAT_MONGO_URI || "mongo-chat";
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
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval "${insertCommand}"`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Participant inserted: ${_id}`);

        return participantToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert participant ${_id}: ${errorMessage}`);
    }

}
