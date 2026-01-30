import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { NotificationsAPI } from '../interfaces/notifications'
import type {
  FollowRecievedEvent,
  LikeRecievedEvent,
  NewEventPublishedEvent,
  NewMessageReceivedEvent,
  NewReviewRecievedEvent,
  Notification,
  NotificationID,
} from '../types/notifications'
import type { UserID } from '../types/users'
import { createWebSocket, type WebSocket } from './webSocket'

export let ws: WebSocket | undefined

export const mockNotificationsApi: NotificationsAPI = {
  async connect(userId, _token) {
    if (ws && ws.getConnectionStatus()) return
    ws = createWebSocket(userId)
    ws.connect()
  },

  async disconnect() {
    ws?.disconnect()
    ws = undefined
  },

  async isUserOnline(_userId: UserID): Promise<boolean> {
    // TODO: Implement online status check
    return Promise.resolve(false)
  },

  async getUnreadNotificationsCount(): Promise<number> {
    // TODO: Implement unread count
    return Promise.resolve(10)
  },

  async getNotifications(_pagination?: PaginatedRequest): Promise<PaginatedResponse<Notification>> {
    // TODO: Implement notification fetching
    return Promise.resolve({
      items: [] as Notification[],
      limit: 10,
      offset: 0,
      hasMore: false,
      totalCount: 0,
    })
  },

  async readNotification(_notificationId: NotificationID): Promise<void> {
    // TODO: Implement mark as read
    return Promise.resolve()
  },

  onLikeReceived(callback: (data: LikeRecievedEvent) => void): void {
    ws?.on('like_received', (event) => callback(event as LikeRecievedEvent))
  },

  onFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    ws?.on('follow_received', (event) => callback(event as FollowRecievedEvent))
  },

  onNewReviewRecieved(callback: (data: NewReviewRecievedEvent) => void): void {
    ws?.on('new_review_received', (event) => callback(event as NewReviewRecievedEvent))
  },

  onNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    ws?.on('new_message_received', (event) => callback(event as NewMessageReceivedEvent))
  },

  onNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    ws?.on('new_event_published', (event) => callback(event as NewEventPublishedEvent))
  },
}
