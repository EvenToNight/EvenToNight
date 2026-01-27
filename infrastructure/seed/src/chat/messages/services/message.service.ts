import crypto from "crypto";
import { MessageToInsert, SeedMessage } from '../types/message.types';

export async function insertMessage(message: MessageToInsert): Promise<SeedMessage> {
    const _id = crypto.randomUUID();

    const DOCKER_CONTAINER =
        process.env.CHAT_MONGO_URI || "eventonight-mongo-chat-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const messageToInsert: SeedMessage = {
        _id,
        ...message,
        createdAt: "Tue Jan 27 2026 19:45:51 GMT+0000 (Coordinated Universal Time)",
        updatedAt: "Tue Jan 27 2026 19:45:51 GMT+0000 (Coordinated Universal Time)",
        __v: 0,
    };
    
    const insertCommand = `db.messages.insertOne(${JSON.stringify(messageToInsert)})`;

    try {
        const { execSync } = await import('child_process');
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Message inserted: ${_id}`);

        return messageToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert message ${_id}: ${errorMessage}`);
    }
}