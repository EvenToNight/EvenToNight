import type { UserID } from './users'

export type ConversationID = string
export interface Message {
  id: string
  senderId: UserID
  content: string
  //   isRead: boolean
  //   isSent: boolean
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

export type SupportWebSocketEventType = 'new_message' | 'message_read' | 'typing'

export interface SupportWebSocketEvent {
  type: SupportWebSocketEventType
  conversationId: ConversationID
  data: unknown
}

export interface NewMessageEvent extends SupportWebSocketEvent {
  type: 'new_message'
  data: {
    message: Message
    conversation: Conversation
  }
}

export interface MessageReadEvent extends SupportWebSocketEvent {
  type: 'message_read'
  data: {
    messageId: string
    readBy: UserID
  }
}

export interface TypingEvent extends SupportWebSocketEvent {
  type: 'typing'
  data: {
    userId: UserID
    isTyping: boolean
  }
}
