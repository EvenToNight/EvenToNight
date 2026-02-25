import { SeedUser } from "../../users/types/users.types";
import { SeedConversation } from "../conversations/types/conversation.types";
import { ParticipantToInsert } from "./types/participant.types";

export function filterParticipants(conversations: SeedConversation[], users: SeedUser[]): ParticipantToInsert[] {
    const participantInserts: ParticipantToInsert[] = [];
    const UserIdMap: Record<string, string> = {};
    for (const user of users) {
        UserIdMap[user.id] = user.name;
    }
    for (const conversation of conversations) {
        participantInserts.push({
            conversationId: conversation._id,
            userId: conversation.userId,
            userName: UserIdMap[conversation.userId],
            role: "member",
        });
        participantInserts.push({
            conversationId: conversation._id,
            userId: conversation.organizationId,
            userName: UserIdMap[conversation.organizationId],
            role: "organization",
        });
    }
    return participantInserts;
}