import { SeedConversation } from "../conversations/types/conversation.types";
import { messagesSeedData } from "./data/message.data";
import { MessageToInsert } from "./types/message.types";

export function filterMessages(conversations: SeedConversation[]): MessageToInsert[] {
    const messageInserts: MessageToInsert[] = [];
    for (const conversation of conversations) {
        messageInserts.push({
            conversationId: conversation._id,
            senderId: conversation.memberId,
            content: `Hello`,
        });
    }
    
    for (const m of messagesSeedData) {
        messageInserts.push({
            conversationId: conversations[0]._id,
            senderId: conversations[0].memberId,
            content: m.content,
        });
    }

    return messageInserts;
}
