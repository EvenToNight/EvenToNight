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
  memberId: UserID
  memberName: string
  memberAvatar: string
  organizationAvatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
}
