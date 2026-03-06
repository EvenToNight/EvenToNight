import { execSync } from "child_process";
import { ObjectId } from "mongodb";
import { ConversationToCreate, SeedConversation } from "../types/conversation.types";

export async function createConversation(conversation: ConversationToCreate): Promise<SeedConversation> {
    const _id = new ObjectId();

    const MONGO_HOST =
        process.env.CHAT_MONGO_URI || "mongo-chat";
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
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval "${insertCommand}"`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Conversation inserted: ${_id}`);

        return conversationToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert conversation ${_id}: ${errorMessage}`);
    }
}
