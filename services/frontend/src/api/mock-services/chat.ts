import type { ChatAPI, ConversationResponse, SendMessageAPIResponse } from '../interfaces/chat'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Conversation, Message } from '../types/chat'
import type { NewMessageEvent } from '../types/notification'
import { getPaginatedItems } from '../utils/requestUtils'
import { mockConversations, mockMessages } from './data/chat'
import { saveConversations, saveMessages } from './storage/chatStorage'
import { activeWebSockets } from './notification'
import type { FirstMessage } from '../types/chat'
import { mockUsers } from './data/users'
import type { User, UserID } from '../types/users'
import type { ConversationID } from '../types/chat'
import type { UnreadMessageResponse } from '../interfaces/chat'

export const mockChatApi: ChatAPI = {
  async startConversation(
    userId: string,
    firstMessage: FirstMessage
  ): Promise<SendMessageAPIResponse> {
    const sender = mockUsers.data.find((u) => u.id === userId)
    const recipient = mockUsers.data.find((u) => u.id === firstMessage.recipientId)
    if (!sender || !recipient) {
      throw {
        message: 'User not found',
        status: 404,
      }
    }
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      organization: sender.role === 'organization' ? sender : recipient,
      member: sender.role === 'member' ? sender : recipient,
      lastMessage: {
        senderId: sender.id,
        content: firstMessage.content,
        createdAt: new Date(),
      },
      unreadCount: 0,
    }
    mockConversations.push(newConversation)
    saveConversations(mockConversations)
    return {
      id: crypto.randomUUID(),
      conversationId: newConversation.id,
      ...newConversation.lastMessage,
    }
  },

  async getConversations(
    userId: string,
    pagination?: PaginatedRequest,
    query?: string
  ): Promise<PaginatedResponse<ConversationResponse>> {
    let users: User[] = []
    if (query) {
      users = mockUsers.data.filter((user) => {
        return (
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase())
        )
      })
    }
    const conversations: ConversationResponse[] = mockConversations.filter((conversation) => {
      return conversation.organization.id === userId || conversation.member.id === userId
    })

    return getPaginatedItems(conversations.concat(users), pagination)
  },

  async sendMessage(
    senderId: UserID,
    conversationId: ConversationID,
    content: string
  ): Promise<SendMessageAPIResponse> {
    console.log('[MockAPI] sendMessage called:', { conversationId, content })
    const message: Message = {
      id: crypto.randomUUID(),
      conversationId,
      senderId,
      content,
      createdAt: new Date(),
      isRead: false,
    }
    mockMessages[conversationId]!.push(message)

    // Save messages to localStorage
    saveMessages(mockMessages)

    const conversation = mockConversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.lastMessage = message
      if (conversation.lastMessage.senderId !== senderId) {
        conversation.unreadCount = 1
      } else {
        conversation.unreadCount++
      }
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

    return message
  },

  async unreadMessageCountFor(userId: UserID): Promise<UnreadMessageResponse> {
    const unreadCount = mockConversations.reduce((count, conversation) => {
      if (
        (conversation.organization.id === userId || conversation.member.id === userId) &&
        conversation.lastMessage.senderId !== userId
      ) {
        return count + conversation.unreadCount
      }
      return count
    }, 0)
    return { unreadCount }
  },
  async getConversationMessages(
    _userId: UserID,
    conversationId: ConversationID,
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

  async readConversationMessages(conversationId: ConversationID, userId: UserID): Promise<void> {
    const messages = mockMessages[conversationId]
    if (!messages) {
      throw {
        message: `Conversation with id ${conversationId} not found`,
        code: 'CONVERSATION_NOT_FOUND',
        status: 404,
      }
    }
    messages.forEach((message) => {
      if (message.senderId !== userId) {
        message.isRead = true
      }
    })
    const conversation = mockConversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }
    saveMessages(mockMessages)
    saveConversations(mockConversations)
  },
}
