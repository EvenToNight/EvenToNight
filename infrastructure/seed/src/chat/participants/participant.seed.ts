import { DataProvider } from "../../seed";
import { SeedUser } from "../../users/types/users.types";
import { SeedConversation } from "../conversations/types/conversation.types";
import { ParticipantSeedResult, ParticipantToInsert, SeedParticipant } from "./types/participant.types";
import { filterParticipants } from "./participants.mapper";
import { insertParticipant } from "./services/participant.service";

export class ParticipantSeed implements DataProvider<ParticipantSeedResult> {
    private conversations: SeedConversation[];
    private users: SeedUser[];

    constructor(conversations: SeedConversation[], users: SeedUser[]) {
        this.conversations = conversations;
        this.users = users;
    }
    
    async populate(): Promise<ParticipantSeedResult> {
        const participantsToInsert: ParticipantToInsert[] = filterParticipants(this.conversations, this.users);
        const participants: SeedParticipant[] = [];

        for (const participant of participantsToInsert) {
            const p = await insertParticipant(participant);
            participants.push(p);
        }

        return { participants };
    }
}