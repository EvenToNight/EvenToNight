import { io, type Socket } from 'socket.io-client'
import type { ApiClient } from '../client'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { NotificationAPI } from '../interfaces/notification'
import type {
  FollowRecievedEvent,
  LikeRecievedEvent,
  NewEventPublishedEvent,
  NewMessageReceivedEvent,
  NewReviewRecievedEvent,
  Notification,
  NotificationData,
  NotificationID,
  TicketSoldEvent,
} from '../types/notification'
import type { UserID } from '../types/users'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'

let socket: Socket | undefined

export const createNotificationApi = (notificationClient: ApiClient): NotificationAPI => ({
  async getNotifications(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Notification>> {
    const queryParams = { ...evaluatePagination(pagination) }
    return notificationClient.get<PaginatedResponse<Notification>>(
      `/users/${userId}/notifications${buildQueryParams(queryParams)}`
    )
  },

  async readNotification(userId: UserID, notificationId: NotificationID): Promise<void> {
    return notificationClient.post<void>(`/users/${userId}/notifications/${notificationId}/read`)
  },

  async getUnreadNotificationsCount(userId: UserID): Promise<number> {
    return notificationClient.get<number>(`/users/${userId}/notifications/unread-count`)
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
    socket?.on('like_received', (event: NotificationData) => {
      callback(event.data as LikeRecievedEvent)
    })
  },

  onFollowReceived(callback: (data: FollowRecievedEvent) => void): void {
    socket?.on('follow_received', (event: NotificationData) => {
      callback(event.data as FollowRecievedEvent)
    })
  },

  onNewReviewRecieved(callback: (data: NewReviewRecievedEvent) => void): void {
    socket?.on('new_review_received', (event: NotificationData) => {
      callback(event.data as NewReviewRecievedEvent)
    })
  },

  onNewMessageReceived(callback: (data: NewMessageReceivedEvent) => void): void {
    socket?.on('new_message_received', (event: NotificationData) => {
      callback(event.data as NewMessageReceivedEvent)
    })
  },

  onNewEventPublished(callback: (data: NewEventPublishedEvent) => void): void {
    socket?.on('new_event_published', (event: NotificationData) => {
      callback(event.data as NewEventPublishedEvent)
    })
  },

  onTicketSold(callback: (data: TicketSoldEvent) => void): void {
    socket?.on('ticket_sold', (event: NotificationData) => {
      callback(event.data as TicketSoldEvent)
    })
  },
})
