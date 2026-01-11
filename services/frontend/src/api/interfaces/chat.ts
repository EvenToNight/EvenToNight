import type { UserID } from '../types/users'
import type { PaginatedRequest, PaginatedResponse } from './commons'
import type {
  ChatUser,
  Conversation,
  ConversationID,
  FirstMessage,
  Message,
  MessageID,
} from '@/api/types/chat'

//TODO: sync type with backend response
export type ConversationResponse = Conversation | ChatUser

export interface ConversationAPIResponse extends Omit<Conversation, 'lastMessage'> {
  lastMessage: {
    sender: UserID
    content: string
    timestamp: Date
  }
}

export interface MessageAPIResponse {
  id: MessageID
  conversationId: ConversationID
  sender: ChatUser
  content: string
  createdAt: Date
  isRead: boolean
}

export type SendMessageAPIResponse = Omit<Message, 'isRead'>

export type UnreadMessageResponse = {
  unreadCount: number
}

export interface ChatAPI {
  startConversation(userId: string, firstMessage: FirstMessage): Promise<SendMessageAPIResponse>
  //TODO: sync with backend to add search query
  getConversations(
    userId: string,
    params?: {
      pagination?: PaginatedRequest
      query?: string
      recipientId?: string
    }
  ): Promise<PaginatedResponse<ConversationResponse>>
  sendMessage(
    senderId: UserID,
    conversationId: ConversationID,
    content: string
  ): Promise<SendMessageAPIResponse>
  unreadMessageCountFor(userId: UserID): Promise<UnreadMessageResponse>
  getConversationMessages(
    userId: UserID,
    conversationId: ConversationID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Message>>
  readConversationMessages(conversationId: ConversationID, userId: UserID): Promise<void>
}
