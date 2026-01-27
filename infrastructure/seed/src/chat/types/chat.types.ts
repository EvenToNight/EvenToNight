import { ConversationSeedResult } from "../conversations/types/conversation.types";

export type SeedChat = ConversationSeedResult

export interface ChatSeedResult {
  chat: SeedChat[];
}