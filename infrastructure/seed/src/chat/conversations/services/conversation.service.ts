import { execSync } from "child_process";
import { ObjectId } from "mongodb";
import { ConversationToCreate, SeedConversation } from "../types/conversation.types";

export async function createConversation(conversation: ConversationToCreate): Promise<SeedConversation> {
    const _id = new ObjectId();
    
    const DOCKER_CONTAINER =
        process.env.CHAT_MONGO_URI || "eventonight-mongo-chat-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";
    
    const now = new Date().toISOString();
    const conversationToCreate = {
        _id,
        ...conversation,
        createdAt: now,
        updatedAt: now,
        __v: 0,
    };

    const insertCommand = `db.conversations.insertOne({
        _id: ObjectId('${_id.toString()}'),
        userId: '${conversation.userId}',
        organizationId: '${conversation.organizationId}',
        createdAt: ISODate('${now}'),
        updatedAt: ISODate('${now}'),
        __v: 0
    })`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval "${insertCommand}"`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Conversation inserted: ${_id}`);

        return conversationToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert conversation ${_id}: ${errorMessage}`);
    }
}