import { SeedConversation } from "../conversations/types/conversation.types";
import { messagesSeedData } from "./data/message.data";
import { MessageToInsert } from "./types/message.types";

export function filterMessages(conversations: SeedConversation[]): MessageToInsert[] {
    const messageInserts: MessageToInsert[] = [];
    for (const conversation of conversations) {
        messageInserts.push({
            conversationId: conversation._id,
            senderId: conversation.userId,
            content: `Hello`,
        });
    }
    let turn = true;
    for (const m of messagesSeedData) {
        messageInserts.push({
            conversationId: conversations[0]._id,
            senderId: turn ? conversations[0].userId : conversations[0].organizationId,
            content: m.content,
        });
        turn = !turn;
    }

    return messageInserts;
}
