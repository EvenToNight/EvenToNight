import type { SupportAPI } from '../interfaces/support'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Conversation, Message } from '../types/support'
import { getPaginatedItems } from '../utils/requestUtils'
import { mockConversations } from './data/support'

export const mockSupportApi: SupportAPI = {
  async getConversations(
    userId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Conversation>> {
    const conversations = mockConversations.filter((conversation) => {
      return conversation.organizationId === userId || conversation.memberId === userId
    })
    return getPaginatedItems(conversations, pagination)
  },
  async getConversationMessages(
    conversationId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Message>> {
    const conversation = mockConversations.find(
      (conversation) => conversation.id === conversationId
    )
    if (!conversation) {
      throw {
        message: `Conversation with id ${conversationId} not found`,
        code: 'CONVERSATION_NOT_FOUND',
        status: 404,
      }
    }
    conversation.unreadCount = 0
    return getPaginatedItems(conversation.messages, pagination)
  },
}
