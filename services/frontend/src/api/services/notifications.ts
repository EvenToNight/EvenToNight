import { io, type Socket } from 'socket.io-client'
import type { ApiClient } from '../client'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { NotificationOnlineStatusPayload, NotificationsAPI } from '../interfaces/notifications'
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
import {
  NotificationAdapter,
  type NotificationAPIData,
  type NotificationAPIResponse,
} from '../adapters/notification'

let socket: Socket | undefined

const handlers = new Map<unknown, { handler: (...args: any[]) => void; eventType: string }>()

function createNotificationHandler<T>(
  callback: (data: T) => void
): (apiEvent: NotificationAPIData) => void {
  return (apiEvent: NotificationAPIData) => {
    const event = NotificationAdapter.fromAPI(apiEvent)
    try {
      callback(event.data as T)
      console.log(`[SOCKET.IO] callback executed successfully:`, callback.name || 'anonymous')
    } catch (error) {
      console.error(`[SOCKET.IO] callback error:`, callback.name || 'anonymous', error)
    }
  }
}

export const createNotificationsApi = (notificationClient: ApiClient): NotificationsAPI => ({
  async getNotifications(pagination?: PaginatedRequest): Promise<PaginatedResponse<Notification>> {
    const queryParams = { ...evaluatePagination(pagination) }
    const response = await notificationClient.get<{
      notifications: PaginatedResponse<NotificationAPIResponse> & {
        notifications: NotificationAPIResponse[]
      }
    }>(`/${buildQueryParams(queryParams)}`)
    return {
      ...response.notifications,
      items: response.notifications.notifications.map((item: NotificationAPIResponse) =>
        NotificationAdapter.fromRestAPI(item)
      ),
    }
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

  async isUserOnline(userId: UserID): Promise<OnlineInfoEvent> {
    return notificationClient.get<OnlineInfoEvent>(`/users/${userId}/is-online`)
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
        handlers.forEach(({ handler, eventType }) => {
          socket?.on(eventType, handler)
        })
        console.log(`[Socket.IO] Re-registered ${handlers.size} handlers`)
      })

      socket.on('user-online', (data: any) => {
        console.log('[Socket.IO] ONLINE:', data)
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
    const onlineHandler = (event: NotificationOnlineStatusPayload) =>
      callback({ userId: event.userId, isOnline: true })
    const offlineHandler = (event: NotificationOnlineStatusPayload) =>
      callback({ userId: event.userId, isOnline: false })
    const onlineEventType = NotificationAdapter.toAPIType('user_online')
    const offlineEventType = NotificationAdapter.toAPIType('user_offline')

    handlers.set(`${callback}_online` as any, {
      handler: onlineHandler,
      eventType: onlineEventType,
    })
    handlers.set(`${callback}_offline` as any, {
      handler: offlineHandler,
      eventType: offlineEventType,
    })

    socket?.on(onlineEventType, onlineHandler)
    socket?.on(offlineEventType, offlineHandler)
  },
  offUserOnline(callback: (online: OnlineInfoEvent) => void): void {
    const onlineEntry = handlers.get(`${callback}_online` as any)
    const offlineEntry = handlers.get(`${callback}_offline` as any)

    if (onlineEntry) {
      socket?.off(onlineEntry.eventType, onlineEntry.handler)
      handlers.delete(`${callback}_online` as any)
    }

    if (offlineEntry) {
      socket?.off(offlineEntry.eventType, offlineEntry.handler)
      handlers.delete(`${callback}_offline` as any)
    }
  },
  onLikeReceived(callback: (data: LikeRecievedEvent) => void): void {
    const handler = createNotificationHandler<LikeRecievedEvent>(callback)
    const eventType = NotificationAdapter.toAPIType('like_received')
    handlers.set(callback, { handler, eventType })
    socket?.on(eventType, handler)
  },

  offLikeReceived(callback: (data: LikeRecievedEvent) => void): void {
    const entry = handlers.get(callback)
    if (entry) {
      socket?.off(entry.eventType, entry.handler)
      handlers.delete(callback)
    }
  },

  onFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    const handler = createNotificationHandler<FollowRecievedEvent>(callback)
    const eventType = NotificationAdapter.toAPIType('follow_received')
    handlers.set(callback, { handler, eventType })
    socket?.on(eventType, handler)
  },

  offFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    const entry = handlers.get(callback)
    if (entry) {
      socket?.off(entry.eventType, entry.handler)
      handlers.delete(callback)
    }
  },

  onNewReviewRecieved(callback: (data: NewReviewRecievedEvent) => void): void {
    const handler = createNotificationHandler<NewReviewRecievedEvent>(callback)
    const eventType = NotificationAdapter.toAPIType('new_review_received')
    handlers.set(callback, { handler, eventType })
    socket?.on(eventType, handler)
  },

  offNewReviewRecieved(callback: (data: NewReviewRecievedEvent) => void): void {
    const entry = handlers.get(callback)
    if (entry) {
      socket?.off(entry.eventType, entry.handler)
      handlers.delete(callback)
    }
  },

  onNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    const handler = createNotificationHandler<NewMessageReceivedEvent>(callback)
    const eventType = NotificationAdapter.toAPIType('new_message_received')
    handlers.set(callback, { handler, eventType })
    socket?.on(eventType, handler)
  },

  offNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    const entry = handlers.get(callback)
    if (entry) {
      socket?.off(entry.eventType, entry.handler)
      handlers.delete(callback)
    }
  },

  onNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    const handler = createNotificationHandler<NewEventPublishedEvent>(callback)
    const eventType = NotificationAdapter.toAPIType('new_event_published')
    handlers.set(callback, { handler, eventType })
    socket?.on(eventType, handler)
  },

  offNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    const entry = handlers.get(callback)
    if (entry) {
      socket?.off(entry.eventType, entry.handler)
      handlers.delete(callback)
    }
  },
})
