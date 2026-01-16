import type { SupportAPI } from '../interfaces/support'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Conversation, Message } from '../types/support'
import type { NewMessageEvent } from '../types/notification'
import { getPaginatedItems } from '../utils/requestUtils'
import { mockConversations, mockMessages } from './data/support'
import { saveConversations, saveMessages } from './storage/supportStorage'
import { activeWebSockets } from './notification'

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
    const messages = mockMessages[conversationId]
    if (!messages) {
      throw {
        message: `Conversation with id ${conversationId} not found`,
        code: 'CONVERSATION_NOT_FOUND',
        status: 404,
      }
    }
    const { items, ...rest } = getPaginatedItems([...messages].reverse(), pagination)
    return {
      ...rest,
      items: items.reverse(),
    }
  },
  async sendMessage(conversationId: string, message: Message): Promise<void> {
    console.log('[MockAPI] sendMessage called:', { conversationId, message })
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = []
    }
    mockMessages[conversationId].push(message)

    // Save messages to localStorage
    saveMessages(mockMessages)

    const conversation = mockConversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.lastMessage = message.content
      conversation.lastMessageTime = message.timestamp
      conversation.lastMessageSenderId = message.senderId

      // Save conversations to localStorage
      saveConversations(mockConversations)

      // Emit WebSocket event to all connected tabs
      const event: NewMessageEvent = {
        type: 'new_message',
        conversationId,
        data: {
          message,
          conversation,
        },
      }

      console.log('[MockAPI] Emitting to', activeWebSockets.size, 'active WebSocket(s)')
      // Notify all active WebSocket connections
      activeWebSockets.forEach((ws) => {
        ws.emit(event)
      })
    }

    return
  },
}
