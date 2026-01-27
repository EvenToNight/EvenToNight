import crypto from "crypto";
import { execSync } from "child_process";
import { ConversationToCreate, SeedConversation } from "../types/conversation.types";
import { create } from "domain";

export async function createConversation(conversation: ConversationToCreate): Promise<SeedConversation> {
    const _id = crypto.randomUUID();
    
    const DOCKER_CONTAINER =
        process.env.CHAT_MONGO_URI || "eventonight-mongo-chat-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";
    
    const conversationToCreate = {
        _id,
        ...conversation,
        createdAt: "Tue Jan 27 2026 19:45:51 GMT+0000 (Coordinated Universal Time)",
        updatedAt: "Tue Jan 27 2026 19:45:51 GMT+0000 (Coordinated Universal Time)",
        __v: 0,
    };

    const insertCommand = `db.conversations.insertOne(${JSON.stringify(conversationToCreate)})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Conversation inserted: ${_id}`);

        return conversationToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert conversation ${_id}: ${errorMessage}`);
    }
}