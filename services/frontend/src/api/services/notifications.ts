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
} from '../types/notifications'
import type { UserID } from '../types/users'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import { NotificationAdapter, type NotificationAPIData } from '../adapters/notification'

let socket: Socket | undefined

export const createNotificationsApi = (notificationClient: ApiClient): NotificationsAPI => ({
  async getNotifications(pagination?: PaginatedRequest): Promise<PaginatedResponse<Notification>> {
    const queryParams = { ...evaluatePagination(pagination) }
    return notificationClient.get<PaginatedResponse<Notification>>(
      `/${buildQueryParams(queryParams)}`
    )
  },

  async readNotification(notificationId: NotificationID): Promise<void> {
    return notificationClient.post<void>(`/notifications/${notificationId}`)
  },

  async getUnreadNotificationsCount(): Promise<number> {
    return notificationClient.get<number>(`/unread-count`)
  },

  async isUserOnline(userId: UserID): Promise<boolean> {
    return notificationClient.get<boolean>(`/users/${userId}/online-status`)
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

  onLikeReceived(callback: (data: LikeRecievedEvent) => void): void {
    socket?.on('notification', (apiEvent: NotificationAPIData) => {
      const event = NotificationAdapter.fromAPI(apiEvent)
      if (event.type !== 'like_received') return
      console.log('[SOCKET.IO] like_received event received:', event)
      callback(event.data as LikeRecievedEvent)
    })
  },

  onFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    socket?.on('notification', (apiEvent: NotificationAPIData) => {
      const event = NotificationAdapter.fromAPI(apiEvent)
      if (event.type !== 'follow_received') return
      console.log('[SOCKET.IO] follow_received event received:', event)
      callback(event.data as FollowRecievedEvent)
    })
  },

  onNewReviewRecieved(callback: (data: NewReviewRecievedEvent) => void): void {
    socket?.on('notification', (apiEvent: NotificationAPIData) => {
      const event = NotificationAdapter.fromAPI(apiEvent)
      if (event.type !== 'new_review_received') return
      console.log('[SOCKET.IO] new_review_received event received:', event)
      callback(event.data as NewReviewRecievedEvent)
    })
  },

  onNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    socket?.on('notification', (apiEvent: NotificationAPIData) => {
      const event = NotificationAdapter.fromAPI(apiEvent)
      if (event.type !== 'new_message_received') return
      console.log('[SOCKET.IO] new_message_received event received:', event)
      callback(event.data as NewMessageReceivedEvent)
    })
  },

  onNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    socket?.on('notification', (apiEvent: NotificationAPIData) => {
      const event = NotificationAdapter.fromAPI(apiEvent)
      if (event.type !== 'new_event_published') return
      console.log('[SOCKET.IO] new_event_published event received:', event)
      callback(event.data as NewEventPublishedEvent)
    })
  },
})
