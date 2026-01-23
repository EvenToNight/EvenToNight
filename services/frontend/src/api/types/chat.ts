import type { User, UserID } from './users'

export type ConversationID = string
export type MessageID = string

export type FirstMessage = {
  recipientId: UserID
  content: string
}

export interface LastMessageData {
  senderId: UserID
  content: string
  createdAt: Date
}

export interface Message {
  id: MessageID
  conversationId: ConversationID
  senderId: UserID
  content: string
  createdAt: Date
  isRead: boolean
  //   isSent: boolean
}

export type ConversationMessages = Record<ConversationID, Message[]>
export type ChatUser = Pick<User, 'id' | 'name' | 'username' | 'avatar' | 'bio'>
export interface Conversation {
  id: ConversationID
  organization: ChatUser
  member: ChatUser
  lastMessage: LastMessageData
  unreadCount: number
}
