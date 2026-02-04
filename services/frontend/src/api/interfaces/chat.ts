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

export interface ConversationAPIResponse extends Omit<Conversation, 'lastMessage'> {
  lastMessage: {
    senderId: UserID
    content: string
    timestamp: Date
  }
}

export interface ConversationBaseInfo {
  id: ConversationID
  organization: ChatUser
  member: ChatUser
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
  //TODO: is user needed?
  getConversation(userId: UserID, conversationId: ConversationID): Promise<Conversation>
  startConversation(userId: UserID, firstMessage: FirstMessage): Promise<SendMessageAPIResponse>
  getConversations(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Conversation>>
  searchConversations(
    userId: UserID,
    params: {
      name: string
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponse<Conversation>>
  getConversationBetween(
    organizationId: UserID,
    memberId: UserID
  ): Promise<ConversationBaseInfo | null>
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
