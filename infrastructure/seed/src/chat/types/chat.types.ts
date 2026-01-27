import { ConversationSeedResult } from "../conversations/types/conversation.types";
import { MessageSeedResult } from "../messages/types/message.types";
import { ParticipantSeedResult } from "../participants/types/participant.types";

export type SeedChat = ConversationSeedResult | ParticipantSeedResult | MessageSeedResult;

export interface ChatSeedResult {
  chat: SeedChat[];
}