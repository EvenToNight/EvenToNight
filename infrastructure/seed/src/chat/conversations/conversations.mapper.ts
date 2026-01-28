import { ConversationToCreate } from "./types/conversation.types";
import { conversationsSeedData } from "./data/conversation.data";
import { SeedUser } from "../../users/types/users.types";

export function filterConversations(users: SeedUser[]): ConversationToCreate[] {
    const UserIdMap: Record<string, string> = {};
    for (const user of users) {
        UserIdMap[user.username] = user.id;
    }

    const conversationsToCreate: ConversationToCreate[] = conversationsSeedData
        .filter(conversation => conversation.member in UserIdMap)
        .map(conversation => ({
            memberId: UserIdMap[conversation.member],
            organizationId: UserIdMap[conversation.organization],
        }));

    return conversationsToCreate;
}