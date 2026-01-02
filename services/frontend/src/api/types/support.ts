import type { UserID } from './users'

export interface Message {
  id: string
  senderId: UserID
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
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
  messages: Message[]
}
