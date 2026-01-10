import type { PaginatedRequest, PaginatedResponse } from './commons'
import type { Conversation, ConversationID, Message } from '@/api/types/chat'

export interface ChatAPI {
  getConversations(
    userId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Conversation>>
  getConversationMessages(
    conversationId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Message>>
  sendMessage(conversationId: ConversationID, message: Message): Promise<void>
}
