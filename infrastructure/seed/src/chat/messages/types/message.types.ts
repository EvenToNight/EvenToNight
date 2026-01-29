import { ObjectId } from "mongodb";

export interface MessageData {
    content: string;
}

export type MessageToInsert = MessageData & {
    conversationId: ObjectId;
    senderId: string;
};

export type SeedMessage = MessageToInsert & {
    _id: ObjectId;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

export interface MessageSeedResult {
    messages: SeedMessage[];
}