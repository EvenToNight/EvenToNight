import { ObjectId } from "mongodb";

export interface ParticipantToInsert {
    conversationId: ObjectId;
    userId: string;
    userName: string;
    role: string;
}

export type SeedParticipant = ParticipantToInsert & {
    _id: ObjectId;
    unreadCount: number;
    lastReadAt: string;
    __v: number;
};

export interface ParticipantSeedResult {
    participants: SeedParticipant[];
}