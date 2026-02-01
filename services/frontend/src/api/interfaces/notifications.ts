import type {
  FollowRecievedEvent,
  LikeRecievedEvent,
  NewEventPublishedEvent,
  NewMessageReceivedEvent,
  NewReviewRecievedEvent,
  NotificationID,
  Notification,
  OnlineInfoEvent,
} from '../types/notifications'
import type { UserID } from '../types/users'
import type { PaginatedRequest, PaginatedResponse } from './commons'
import type { AccessToken } from './users'

export interface NotificationOnlineStatusPayload {
  userId: UserID
}

export interface NotificationsAPI {
  connect(userId: UserID, token: AccessToken): Promise<void>
  disconnect(): Promise<void>
  isUserOnline: (userId: UserID) => Promise<OnlineInfoEvent>
  getUnreadNotificationsCount: () => Promise<number>
  getNotifications: (pagination?: PaginatedRequest) => Promise<PaginatedResponse<Notification>>
  readNotification: (notificationId: NotificationID) => Promise<void>
  readAllNotifications: () => Promise<void>
  onUserOnline: (callback: (online: OnlineInfoEvent) => void) => void
  offUserOnline: (callback: (online: OnlineInfoEvent) => void) => void
  onLikeReceived: (callback: (data: LikeRecievedEvent) => void) => void
  offLikeReceived: (callback: (data: LikeRecievedEvent) => void) => void
  onFollowReceived: (callback: (data: FollowRecievedEvent) => void) => void
  offFollowReceived: (callback: (data: FollowRecievedEvent) => void) => void
  onNewReviewReceived: (callback: (data: NewReviewRecievedEvent) => void) => void
  offNewReviewReceived: (callback: (data: NewReviewRecievedEvent) => void) => void
  onNewMessageReceived: (callback: (data: NewMessageReceivedEvent) => void) => void
  offNewMessageReceived: (callback: (data: NewMessageReceivedEvent) => void) => void
  onNewEventPublished: (callback: (data: NewEventPublishedEvent) => void) => void
  offNewEventPublished: (callback: (data: NewEventPublishedEvent) => void) => void
}
