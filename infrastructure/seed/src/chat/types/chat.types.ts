import { ConversationSeedResult } from "../conversations/types/conversation.types";
import { ParticipantSeedResult } from "../participants/types/participant.types";

export type SeedChat = ConversationSeedResult | ParticipantSeedResult;

export interface ChatSeedResult {
  chat: SeedChat[];
}