import { io, type Socket } from 'socket.io-client'
import type { ApiClient } from '../client'
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
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import { NotificationAdapter, type NotificationAPIData } from '../adapters/notification'

let socket: Socket | undefined

const handlers = new Map<unknown, (apiEvent: NotificationAPIData) => void>()

function createNotificationHandler<T>(
  callback: (data: T) => void
): (apiEvent: NotificationAPIData) => void {
  return (apiEvent: NotificationAPIData) => {
    const event = NotificationAdapter.fromAPI(apiEvent)
    console.log(`[SOCKET.IO] event received:`, event)
    callback(event.data as T)
  }
}

export const createNotificationsApi = (notificationClient: ApiClient): NotificationsAPI => ({
  async getNotifications(pagination?: PaginatedRequest): Promise<PaginatedResponse<Notification>> {
    const queryParams = { ...evaluatePagination(pagination) }
    return notificationClient.get<PaginatedResponse<Notification>>(
      `/${buildQueryParams(queryParams)}`
    )
  },

  async readNotification(notificationId: NotificationID): Promise<void> {
    return notificationClient.post<void>(`/${notificationId}`)
  },

  async readAllNotifications(): Promise<void> {
    return notificationClient.post<void>(`/read-all`)
  },

  async getUnreadNotificationsCount(): Promise<number> {
    return notificationClient.get<number>(`/unread-count`)
  },

  async isUserOnline(userId: UserID): Promise<boolean> {
    return notificationClient.get<boolean>(`/users/${userId}/is-online`)
  },

  async connect(userId: UserID, token?: string): Promise<void> {
    if (socket?.connected) {
      console.log('[Socket.IO] already connected')
      return
    }

    try {
      const url = notificationClient.baseUrl
      console.log('[Socket.IO] Connecting to:', url)

      socket = io(url, {
        auth: {
          token: token,
          userId,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        withCredentials: true,
        transports: ['websocket', 'polling'],
      })

      socket.on('connect', () => {
        console.log('[Socket.IO] Connected')
        handlers.forEach((handler) => {
          socket?.on('notification', handler)
        })
        console.log(`[Socket.IO] Re-registered ${handlers.size} handlers`)
      })

      socket.on('registered', (data: { userId: string }) => {
        console.log('[Socket.IO] Registered with user ID:', data.userId)
      })

      socket.on('disconnect', (reason: string) => {
        console.log('[Socket.IO] Disconnected:', reason)
      })

      socket.on('connect_error', (error: Error) => {
        console.error('[Socket.IO] connection error:', error)
      })
      socket.on('notification', (apiEvent: NotificationAPIData) => {
        console.log('[Socket.IO] notification event received:', apiEvent)
      })
      socket.on('error', (error: Error) => {
        console.error('[Socket.IO] error:', error)
      })
    } catch (error) {
      console.error('[Socket.IO] Failed to create connection:', error)
      throw error
    }
  },

  async disconnect(): Promise<void> {
    socket?.disconnect()
    socket = undefined
    console.log('[Socket.IO] Disconnected and cleaned up')
  },

  onUserOnline(callback: (online: OnlineInfoEvent) => void): void {
    const onlineHandler = () => callback(true)
    const offlineHandler = () => callback(false)
    handlers.set(callback, onlineHandler)
    handlers.set(callback, offlineHandler)
    socket?.on(NotificationAdapter.toAPIType('user_online'), onlineHandler)
    socket?.on(NotificationAdapter.toAPIType('user_offline'), offlineHandler)
  },
  offUserOnline(callback: (online: OnlineInfoEvent) => void): void {
    const onlineHandler = handlers.get(() => callback(true))
    const offlineHandler = handlers.get(() => callback(false))
    if (onlineHandler) {
      socket?.off(NotificationAdapter.toAPIType('user_online'), onlineHandler)
      handlers.delete(callback)
    }
    if (offlineHandler) {
      socket?.off(NotificationAdapter.toAPIType('user_offline'), offlineHandler)
      handlers.delete(callback)
    }
  },
  onLikeReceived(callback: (data: LikeRecievedEvent) => void): void {
    const handler = createNotificationHandler<LikeRecievedEvent>(callback)
    handlers.set(callback, handler)
    socket?.on(NotificationAdapter.toAPIType('like_received'), handler)
  },

  offLikeReceived(callback: (data: LikeRecievedEvent) => void): void {
    const handler = handlers.get(callback)
    if (handler) {
      socket?.off(NotificationAdapter.toAPIType('like_received'), handler)
      handlers.delete(callback)
    }
  },

  onFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    const handler = createNotificationHandler<FollowRecievedEvent>(callback)
    handlers.set(callback, handler)
    socket?.on(NotificationAdapter.toAPIType('follow_received'), handler)
  },

  offFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    const handler = handlers.get(callback)
    if (handler) {
      socket?.off(NotificationAdapter.toAPIType('follow_received'), handler)
      handlers.delete(callback)
    }
  },

  onNewReviewRecieved(callback: (data: NewReviewRecievedEvent) => void): void {
    const handler = createNotificationHandler<NewReviewRecievedEvent>(callback)
    handlers.set(callback, handler)
    socket?.on(NotificationAdapter.toAPIType('new_review_received'), handler)
  },

  offNewReviewRecieved(callback: (data: NewReviewRecievedEvent) => void): void {
    const handler = handlers.get(callback)
    if (handler) {
      socket?.off(NotificationAdapter.toAPIType('new_review_received'), handler)
      handlers.delete(callback)
    }
  },

  onNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    const handler = createNotificationHandler<NewMessageReceivedEvent>(callback)
    handlers.set(callback, handler)
    socket?.on(NotificationAdapter.toAPIType('new_message_received'), handler)
  },

  offNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    const handler = handlers.get(callback)
    if (handler) {
      socket?.off(NotificationAdapter.toAPIType('new_message_received'), handler)
      console.log('[Socket.IO] Off NewMessageReceived handler removed')
      handlers.delete(callback)
    }
  },

  onNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    const handler = createNotificationHandler<NewEventPublishedEvent>(callback)
    handlers.set(callback, handler)
    socket?.on(NotificationAdapter.toAPIType('new_event_published'), handler)
  },

  offNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    const handler = handlers.get(callback)
    if (handler) {
      socket?.off(NotificationAdapter.toAPIType('new_event_published'), handler)
      handlers.delete(callback)
    }
  },
})
