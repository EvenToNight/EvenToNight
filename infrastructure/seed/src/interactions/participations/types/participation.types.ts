export interface ParticipationToCreate {
    eventId: string;
    userId: string;
}

export type SeedParticipation = ParticipationToCreate & {
    _id: string;
};

export interface ParticipationSeedResult {
    participations: SeedParticipation[];
}