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
  OnlineInfoEvent,
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

  async isUserOnline(userId: UserID): Promise<OnlineInfoEvent> {
    // TODO: Implement online status check
    return Promise.resolve({ userId, isOnline: true } as OnlineInfoEvent)
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

  async readAllNotifications(): Promise<void> {
    // TODO: Implement mark all as read
    return Promise.resolve()
  },

  onUserOnline(callback: (online: OnlineInfoEvent) => void): void {
    ws?.on('user_online', (event) => callback(event as OnlineInfoEvent))
  },

  offUserOnline(callback: (online: OnlineInfoEvent) => void): void {
    ws?.off('user_online', (event) => callback(event as OnlineInfoEvent))
  },

  onLikeReceived(callback: (data: LikeRecievedEvent) => void): void {
    ws?.on('like_received', (event) => callback(event as LikeRecievedEvent))
  },

  offLikeReceived(callback: (data: LikeRecievedEvent) => void): void {
    ws?.off('like_received', (event) => callback(event as LikeRecievedEvent))
  },

  onFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    ws?.on('follow_received', (event) => callback(event as FollowRecievedEvent))
  },

  offFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    ws?.off('follow_received', (event) => callback(event as FollowRecievedEvent))
  },

  onNewReviewReceived(callback: (data: NewReviewRecievedEvent) => void): void {
    ws?.on('new_review_received', (event) => callback(event as NewReviewRecievedEvent))
  },

  offNewReviewReceived(callback: (data: NewReviewRecievedEvent) => void): void {
    ws?.off('new_review_received', (event) => callback(event as NewReviewRecievedEvent))
  },

  onNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    ws?.on('new_message_received', (event) => callback(event as NewMessageReceivedEvent))
  },

  offNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    ws?.off('new_message_received', (event) => callback(event as NewMessageReceivedEvent))
  },

  onNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    ws?.on('new_event_published', (event) => callback(event as NewEventPublishedEvent))
  },
  offNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    ws?.off('new_event_published', (event) => callback(event as NewEventPublishedEvent))
  },
}
