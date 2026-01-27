import { SeedUser } from "../../users/types/users.types";
import { SeedConversation } from "../conversations/types/conversation.types";
import { ParticipantToInsert, SeedParticipant } from "./types/participant.types";

export function filterParticipants(conversations: SeedConversation[], users: SeedUser[]): ParticipantToInsert[] {
    const participantInserts: ParticipantToInsert[] = [];
    const UserIdMap: Record<string, string> = {};
    for (const user of users) {
        UserIdMap[user.id] = user.name;
    }
    for (const conversation of conversations) {
        participantInserts.push({
            conversationId: conversation._id,
            userId: conversation.memberId,
            userName: UserIdMap[conversation.memberId],
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