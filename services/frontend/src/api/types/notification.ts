import type { ConversationID, MessageContent, MessageID } from './chat'
import type { UserID } from './users'
import type { EventID } from './events'

export type NotificationID = string

export type NotificationType =
  | 'like_received'
  | 'follow_received'
  | 'new_review_received'
  | 'new_message_received'
  | 'new_event_published'
  | 'ticket_sold'

export type NotificationEvent =
  | LikeRecievedEvent
  | FollowRecievedEvent
  | NewReviewRecievedEvent
  | NewMessageReceivedEvent
  | NewEventPublishedEvent
  | TicketSoldEvent

export interface NotificationData {
  type: NotificationType
  data: NotificationEvent
}

export interface Notification extends NotificationData {
  id: NotificationID
}

export interface LikeRecievedEvent {
  eventId: EventID
  eventName: string
  userId: UserID
  userName: string
}

export interface FollowRecievedEvent {
  followerId: UserID
  followerName: string
}

//TODO: evaluate usage
export interface NewReviewRecievedEvent {
  userId: UserID
  userName: string
}

export interface NewMessageReceivedEvent {
  conversationId: ConversationID
  senderId: UserID
  senderName: string
  messageId: MessageID
  message: MessageContent
}

export interface NewEventPublishedEvent {
  creatorId: UserID
  creatorName: string
  eventId: EventID
  eventName: string
}

export interface TicketSoldEvent {
  userId: UserID
  userName: string
  eventId: EventID
  eventName: string
}
