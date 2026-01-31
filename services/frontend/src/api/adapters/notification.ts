import type { NotificationData, NotificationEvent, NotificationType } from '../types/notifications'

export type APINotificationType = 'review' | 'like' | 'follow' | 'message' | 'new_event'
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
