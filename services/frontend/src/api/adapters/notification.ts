import type { NotificationData, NotificationEvent, NotificationType } from '../types/notifications'

export type APINotificationType =
  | 'review'
  | 'like'
  | 'follow'
  | 'message'
  | 'new_event'
  | 'user_online'
  | 'user_offline'
export type NotificationAPIData = {
  type: APINotificationType
  metadata: NotificationEvent
}
export const NotificationAdapter = {
  fromAPIType(apiType: APINotificationType): NotificationType {
    switch (apiType) {
      case 'like':
        return 'like_received'
      case 'follow':
        return 'follow_received'
      case 'review':
        return 'new_review_received'
      case 'message':
        return 'new_message_received'
      case 'new_event':
        return 'new_event_published'
      case 'user_online':
        return 'user_online'
      case 'user_offline':
        return 'user_offline'
      default:
        throw new Error(`Unknown API notification type: ${apiType}`)
    }
  },

  toAPIType(apiType: NotificationType): APINotificationType {
    switch (apiType) {
      case 'like_received':
        return 'like'
      case 'follow_received':
        return 'follow'
      case 'new_review_received':
        return 'review'
      case 'new_message_received':
        return 'message'
      case 'new_event_published':
        return 'new_event'
      case 'user_online':
        return 'user_online'
      case 'user_offline':
        return 'user_offline'
      default:
        throw new Error(`Unknown API notification type: ${apiType}`)
    }
  },

  fromAPI(data: NotificationAPIData): NotificationData {
    return {
      type: this.fromAPIType(data.type),
      data: data.metadata,
    }
  },
}
