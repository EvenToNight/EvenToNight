import { ObjectId } from "mongodb";
import { MessageToInsert, SeedMessage } from '../types/message.types';

export async function insertMessage(message: MessageToInsert): Promise<SeedMessage> {
    const _id = new ObjectId();

    const DOCKER_CONTAINER =
        process.env.CHAT_MONGO_URI || "eventonight-mongo-chat-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const now = new Date().toISOString();
    const messageToInsert: SeedMessage = {
        _id,
        ...message,
        createdAt: now,
        updatedAt: now,
        __v: 0,
    };
    
    const insertCommand = `db.messages.insertOne({
        _id: ObjectId('${_id.toString()}'),
        conversationId: ObjectId('${message.conversationId.toString()}'),
        senderId: '${message.senderId}',
        content: '${message.content.replace(/'/g, "\\'").replace(/"/g, '\\"')}',
        createdAt: ISODate('${now}'),
        updatedAt: ISODate('${now}'),
        __v: 0
    })`;

    try {
        const { execSync } = await import('child_process');
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval "${insertCommand}"`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Message inserted: ${_id}`);

        return messageToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert message ${_id}: ${errorMessage}`);
    }
}