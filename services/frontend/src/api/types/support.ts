import type { UserID } from './users'

export type ConversationID = string
export interface Message {
  id: string
  senderId: UserID
  content: string
  timestamp: Date
}

export type ConversationMessages = Record<ConversationID, Message[]>

export interface Conversation {
  id: ConversationID
  organizationId: UserID
  organizationName: string
  organizationAvatar: string
  memberId: UserID
  memberName: string
  memberAvatar: string
  lastMessage: string
  lastMessageTime: Date
  lastMessageSenderId: UserID
  unreadCount: number
}
