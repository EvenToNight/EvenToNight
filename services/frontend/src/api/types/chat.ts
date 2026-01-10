import type { UserID } from './users'

export type ConversationID = string
export interface MessageData {
  senderId: UserID
  content: string
  timestamp: Date
  //   isRead: boolean
  //   isSent: boolean
}
export interface Message extends MessageData {
  id: string
}

export type ConversationMessages = Record<ConversationID, Message[]>
export type User = {
  id: UserID
  name: string
  username: string
  avatar: string
}
export interface Conversation {
  id: ConversationID
  organization: User
  member: User
  lastMessage: MessageData
  unreadCount: number
}
