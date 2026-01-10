import type { User, UserID } from './users'

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
export type ChatUser = Pick<User, 'id' | 'name' | 'username' | 'avatar'>
export interface Conversation {
  id: ConversationID
  organization: ChatUser
  member: ChatUser
  lastMessage: MessageData
  unreadCount: number
}
