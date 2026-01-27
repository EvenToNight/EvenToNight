
export interface ParticipantToInsert {
    conversationId: string;
    userId: string;
    userName: string;
    role: string;
}

export type SeedParticipant = ParticipantToInsert & {
    _id: string;
    unreadCount: number;
    lastReadAt: string;
    __v: number;
};

export interface ParticipantSeedResult {
    participants: SeedParticipant[];
}