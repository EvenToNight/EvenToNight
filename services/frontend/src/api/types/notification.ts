import type { ConversationID, Conversation, Message } from './chat'
export type SupportWebSocketEventType = 'new_message' | 'message_read' | 'typing'
export type WebSocketEventType = SupportWebSocketEventType
export type WebSocketEvent = SupportWebSocketEvent

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
