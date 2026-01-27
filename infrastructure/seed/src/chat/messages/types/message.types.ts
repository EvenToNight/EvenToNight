import { ObjectId } from "mongodb";

export interface MessageData {
    content: string;
}

export type MessageToInsert = MessageData & {
    conversationId: string;
    senderId: string;
};

export type SeedMessage = MessageToInsert & {
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

export interface MessageSeedResult {
    messages: SeedMessage[];
}