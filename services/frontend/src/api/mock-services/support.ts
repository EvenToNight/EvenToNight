import type { SupportAPI } from '../interfaces/support'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Conversation, Message } from '../types/support'
import { getPaginatedItems } from '../utils/requestUtils'
import { mockConversations, mockMessages } from './data/support'

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
    const messages = mockMessages[conversationId]?.reverse()
    if (!messages) {
      throw {
        message: `Conversation with id ${conversationId} not found`,
        code: 'CONVERSATION_NOT_FOUND',
        status: 404,
      }
    }
    const { items, ...rest } = getPaginatedItems(messages, pagination)
    return {
      ...rest,
      items: items.reverse(),
    }
  },
  async sendMessage(conversationId: string, message: Message): Promise<void> {
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = []
    }
    mockMessages[conversationId].push(message)

    const conversation = mockConversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.lastMessage = message.content
      conversation.lastMessageTime = message.timestamp
      conversation.lastMessageSenderId = message.senderId
    }

    return
  },
}
