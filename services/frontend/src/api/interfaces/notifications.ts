import type {
  FollowRecievedEvent,
  LikeRecievedEvent,
  NewEventPublishedEvent,
  NewMessageReceivedEvent,
  NewReviewRecievedEvent,
  NotificationID,
  Notification,
} from '../types/notifications'
import type { UserID } from '../types/users'
import type { PaginatedRequest, PaginatedResponse } from './commons'
import type { AccessToken } from './users'

export interface NotificationsAPI {
  connect(userId: UserID, token: AccessToken): Promise<void>
  disconnect(): Promise<void>
  //TODO: missing
  isUserOnline: (userId: UserID) => Promise<boolean>
  getUnreadNotificationsCount: () => Promise<number>
  getNotifications: (pagination?: PaginatedRequest) => Promise<PaginatedResponse<Notification>>
  readNotification: (notificationId: NotificationID) => Promise<void>
  onLikeReceived: (callback: (data: LikeRecievedEvent) => void) => void
  onFollowReceived: (callback: (data: FollowRecievedEvent) => void) => void
  onNewReviewRecieved: (callback: (data: NewReviewRecievedEvent) => void) => void
  onNewMessageReceived: (callback: (data: NewMessageReceivedEvent) => void) => void
  onNewEventPublished: (callback: (data: NewEventPublishedEvent) => void) => void
}
