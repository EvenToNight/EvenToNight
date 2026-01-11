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
import { searchMockUsersByName } from './users'

function emitNewMessageEvent(conversation: Conversation, message: Message) {
  const event: NewMessageEvent = {
    type: 'new_message',
    conversationId: conversation.id,
    data: {
      message: { ...message },
      conversation: { ...conversation },
    },
  }

  console.log(
    '[MockAPI] Emitting new conversation to',
    activeWebSockets.size,
    'active WebSocket(s)'
  )
  activeWebSockets.forEach((ws) => {
    ws.emit(event)
  })
}
function getConversationsForUser(userId: UserID): Conversation[] {
  return mockConversations.filter(
    (conversation) => conversation.organization.id === userId || conversation.member.id === userId
  )
}
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
      unreadCount: 1,
    }
    mockConversations.push(newConversation)
    saveConversations(mockConversations)

    const newMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: newConversation.id,
      ...newConversation.lastMessage,
      isRead: false,
    }

    mockMessages[newConversation.id] = [newMessage]
    saveMessages(mockMessages)
    emitNewMessageEvent(newConversation, newMessage)
    return { ...newMessage }
  },

  async getConversations(
    userId: string,
    params?: {
      pagination?: PaginatedRequest
      query?: string
      recipientId?: string
    }
  ): Promise<PaginatedResponse<ConversationResponse>> {
    let conversations: Conversation[] = getConversationsForUser(userId)
    if (params?.query) {
      conversations = conversations.filter((c) => {
        const otherUser = c.organization.id === userId ? c.member : c.organization
        return (
          otherUser.name.toLowerCase().includes(params.query!.toLowerCase()) ||
          otherUser.username.toLowerCase().includes(params.query!.toLowerCase())
        )
      })
    }
    if (params?.recipientId) {
      conversations = getConversationsForUser(params.recipientId)
    }
    // Calculate unreadCount per-user dynamically
    // If the user sent the last message, they have 0 unread
    // Otherwise, use the stored unreadCount (which represents messages from the other user)
    conversations = conversations.map((c) => {
      if (c.lastMessage.senderId === userId) {
        return { ...c, unreadCount: 0 }
      } else {
        return c
      }
    })

    const currentUser = mockUsers.data.find((u) => u.id === userId)!
    if (!currentUser) {
      throw {
        message: 'User not found',
        status: 404,
      }
    }
    const users: User[] = params?.query
      ? searchMockUsersByName(params.query)
          .filter((u) => u.role !== currentUser.role)
          .filter(
            (u) => !conversations.some((c) => c.organization.id === u.id || c.member.id === u.id)
          )
      : []

    const results: ConversationResponse[] = [...conversations, ...users]
    return getPaginatedItems(results, params?.pagination)
  },

  async sendMessage(
    senderId: UserID,
    conversationId: ConversationID,
    content: string
  ): Promise<SendMessageAPIResponse> {
    const message: Message = {
      id: crypto.randomUUID(),
      conversationId,
      senderId,
      content,
      createdAt: new Date(),
      isRead: false,
    }

    mockMessages[conversationId]!.push(message)
    saveMessages(mockMessages)
    const conversation = mockConversations.find((c) => c.id === conversationId)!
    const previousSenderId = conversation.lastMessage.senderId
    conversation.lastMessage = message
    if (previousSenderId !== senderId) {
      conversation.unreadCount = 1
    } else {
      conversation.unreadCount += 1
    }
    saveConversations(mockConversations)
    emitNewMessageEvent(conversation, message)
    return { ...message }
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
    userId: UserID,
    conversationId: ConversationID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Message>> {
    await this.readConversationMessages(conversationId, userId)
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
    // TODO can be improved, something like change only if read request didn't came from the sender of last message
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
    const conversation = mockConversations.find((c) => c.id === conversationId)!
    conversation.unreadCount = messages.reduce((count, message) => {
      if (!message.isRead) {
        return count + 1
      }
      return count
    }, 0)
    saveMessages(mockMessages)
    saveConversations(mockConversations)
  },
}
