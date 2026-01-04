import type { PaginatedRequest, PaginatedResponse } from './commons'
import type { Conversation, ConversationID, Message } from '@/api/types/support'
import type { SupportWebSocket } from '@/api/mock-services/supportWebSocket'

export interface SupportAPI {
  getConversations(
    userId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Conversation>>
  getConversationMessages(
    conversationId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Message>>
  sendMessage(conversationId: ConversationID, message: Message): Promise<void>
  createWebSocket(userId: string): SupportWebSocket
}
