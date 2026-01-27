export interface ConversationToCreate {
    memberId: string;
    organizationId: string;
}

export type SeedConversation = ConversationToCreate & {
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

export interface ConversationSeedResult {
    conversations: SeedConversation[];
}