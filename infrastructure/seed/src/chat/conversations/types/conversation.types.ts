import { ObjectId } from "mongodb";

export interface ConversationToCreate {
    memberId: string;
    organizationId: string;
}

export type SeedConversation = ConversationToCreate & {
    _id: ObjectId;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

export interface ConversationSeedResult {
    conversations: SeedConversation[];
}