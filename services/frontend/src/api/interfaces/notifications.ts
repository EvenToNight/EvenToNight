import type {
  FollowRecievedEvent,
  LikeRecievedEvent,
  NewEventPublishedEvent,
  NewMessageReceivedEvent,
  NewReviewRecievedEvent,
  NotificationID,
  Notification,
  TicketSoldEvent,
} from '../types/notifications'
import type { UserID } from '../types/users'
import type { PaginatedRequest, PaginatedResponse } from './commons'
import type { AccessToken } from './users'

export interface NotificationsAPI {
  connect(userId: UserID, token: AccessToken): Promise<void>
  disconnect(): Promise<void>
  isUserOnline: (userId: UserID) => Promise<boolean>
  getUnreadNotificationsCount: (userId: UserID) => Promise<number>
  getNotifications: (
    userId: UserID,
    pagination?: PaginatedRequest
  ) => Promise<PaginatedResponse<Notification>>
  readNotification: (userId: UserID, notificationId: NotificationID) => Promise<void>
  onLikeReceived: (callback: (data: LikeRecievedEvent) => void) => void
  onFollowReceived: (callback: (data: FollowRecievedEvent) => void) => void
  onNewReviewRecieved: (callback: (data: NewReviewRecievedEvent) => void) => void
  onNewMessageReceived: (callback: (data: NewMessageReceivedEvent) => void) => void
  onNewEventPublished: (callback: (data: NewEventPublishedEvent) => void) => void
  onTicketSold: (callback: (data: TicketSoldEvent) => void) => void
}
