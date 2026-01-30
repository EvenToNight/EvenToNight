import type { ChatAPI, SendMessageAPIResponse } from '../interfaces/chat'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Conversation, Message } from '../types/chat'
import { getPaginatedItems } from '../utils/requestUtils'
import { mockConversations, mockMessages } from './data/chat'
import { saveConversations, saveMessages } from './storage/chatStorage'
import type { FirstMessage } from '../types/chat'
import { mockUsers } from './data/users'
import type { User, UserID } from '../types/users'
import type { ConversationID } from '../types/chat'
import type { UnreadMessageResponse } from '../interfaces/chat'
import { searchMockUsersByName } from './users'

function getConversationsForUser(userId: UserID): Conversation[] {
  return mockConversations().filter(
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
    const currentConversations = mockConversations()
    currentConversations.unshift(newConversation)
    saveConversations(currentConversations)

    const newMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: newConversation.id,
      ...newConversation.lastMessage!,
      isRead: false,
    }

    const currentMessages = mockMessages()
    currentMessages[newConversation.id] = [newMessage]
    saveMessages(currentMessages)
    //TODO: emit message event to ws
    return { ...newMessage }
  },

  async getConversations(
    userId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Conversation>> {
    let conversations: Conversation[] = getConversationsForUser(userId)
    conversations = conversations.map((c) => {
      if (c.lastMessage?.senderId === userId) {
        return { ...c, unreadCount: 0 }
      } else {
        return c
      }
    })
    return getPaginatedItems(conversations, pagination)
  },

  async searchConversations(
    userId: string,
    params: {
      name: string
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponse<Conversation>> {
    const conversations: Conversation[] = getConversationsForUser(userId).filter((c) => {
      const otherUser = c.organization.id === userId ? c.member : c.organization
      return (
        otherUser.name.toLowerCase().includes(params.name.toLowerCase()) ||
        otherUser.username.toLowerCase().includes(params.name.toLowerCase())
      )
    })
    const currentUser = mockUsers.data.find((u) => u.id === userId)!
    if (!currentUser) {
      throw {
        message: 'User not found',
        status: 404,
      }
    }
    const users: User[] = searchMockUsersByName(params.name)
      .filter((u) => u.role !== currentUser.role)
      .filter((u) => !conversations.some((c) => c.organization.id === u.id || c.member.id === u.id))
    const newConversations = users.map((u) => {
      return {
        id: '',
        organization: currentUser.role === 'organization' ? currentUser : u,
        member: currentUser.role === 'member' ? currentUser : u,
        lastMessage: undefined,
        unreadCount: 0,
      }
    })
    return getPaginatedItems([...conversations, ...newConversations], params.pagination)
  },

  async getConversation(organizationId: string, memberId: string): Promise<Conversation | null> {
    const conversation = mockConversations().find(
      (c) =>
        (c.organization.id === organizationId && c.member.id === memberId) ||
        (c.organization.id === memberId && c.member.id === organizationId)
    )
    return conversation || null
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

    const currentMessages = mockMessages()
    currentMessages[conversationId]!.push(message)
    saveMessages(currentMessages)
    const conversationIndex = mockConversations().findIndex((c) => c.id === conversationId)
    const conversation = mockConversations()[conversationIndex]!
    const previousSenderId = conversation.lastMessage?.senderId
    conversation.lastMessage = message
    if (previousSenderId === senderId) {
      conversation.unreadCount += 1
    } else {
      conversation.unreadCount = 1
    }
    // Move conversation to top
    const currentConversations = mockConversations()
    currentConversations.splice(conversationIndex, 1)
    currentConversations.unshift(conversation)
    saveConversations(currentConversations)
    //TODO: emit message event to ws
    return { ...message }
  },

  async unreadMessageCountFor(userId: UserID): Promise<UnreadMessageResponse> {
    const unreadCount = mockConversations().reduce((count, conversation) => {
      if (
        (conversation.organization.id === userId || conversation.member.id === userId) &&
        conversation.lastMessage?.senderId !== userId
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
    const messages = mockMessages()[conversationId]
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
    const currentMessages = mockMessages()
    const messages = currentMessages[conversationId]
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
    const conversations = mockConversations()
    const conversation = conversations.find((c) => c.id === conversationId)!
    // Count only unread messages from the OTHER user (not from current user)
    const unreadCount = messages.reduce((count, message) => {
      if (!message.isRead) {
        return count + 1
      }
      return count
    }, 0)

    conversation.unreadCount = unreadCount
    saveMessages(currentMessages)
    saveConversations(conversations)
  },
}
