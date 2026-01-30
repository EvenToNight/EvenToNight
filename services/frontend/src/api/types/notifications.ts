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

export type NotificationEvent =
  | LikeRecievedEvent
  | FollowRecievedEvent
  | NewReviewRecievedEvent
  | NewMessageReceivedEvent
  | NewEventPublishedEvent

export interface NotificationData {
  type: NotificationType
  data: NotificationEvent
}

export interface Notification extends NotificationData {
  id: NotificationID
  read: boolean
}

export interface LikeRecievedEvent {
  eventId: EventID
  eventName: string
  userId: UserID
  userName: string
  userAvatar: string
}

export interface FollowRecievedEvent {
  followerId: UserID
  followerName: string
  followerAvatar: string
}

//TODO: evaluate usage
export interface NewReviewRecievedEvent {
  eventId: EventID
  userId: UserID
  userName: string
  userAvatar: string
}

export interface NewMessageReceivedEvent {
  conversationId: ConversationID
  senderId: UserID
  senderName: string
  senderAvatar: string
  messageId: MessageID
  message: MessageContent
  createdAt: Date
}

export interface NewEventPublishedEvent {
  creatorId: UserID
  creatorName: string
  eventId: EventID
  eventName: string
}
