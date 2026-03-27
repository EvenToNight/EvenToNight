import { ObjectId } from "mongodb";
import { MessageToInsert, SeedMessage } from '../types/message.types';
import { execSync } from "child_process";

export async function insertMessage(message: MessageToInsert): Promise<SeedMessage> {
    const _id = new ObjectId();

    const MONGO_HOST =
        process.env.CHAT_MONGO_URI || "mongo-chat";
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
        execSync(
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval "${insertCommand}"`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Message inserted: ${_id}`);

        return messageToInsert;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert message ${_id}: ${errorMessage}`);
    }
}
