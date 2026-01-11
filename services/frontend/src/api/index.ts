import { mockEventsApi } from './mock-services/events'
import { createEventsApi } from './services/events'
import { mediaApi } from './services/media'
import { mockFeedApi } from './mock-services/feed'
import { createFeedApi } from './services/feed'
import { mockInteractionsApi } from './mock-services/interactions'
import { createInteractionsApi } from './services/interactions'
import { mockUsersApi } from './mock-services/users'
import { createChatApi } from './services/chat'
// import { createUsersApi } from './services/users'
import {
  createEventsClient,
  createInteractionsClient,
  createChatClient,
  // createFeedClient,
  // createUsersClient,
} from './client'
import { mockChatApi, syncMessageFromWebSocket } from './mock-services/chat'
import { mockNotificationApi } from './mock-services/notification'
import type { Message, Conversation } from './types/chat'

const useRealApi: boolean = import.meta.env.VITE_USE_MOCK_API === 'false'
console.log('Using real API:', useRealApi)

export const api = {
  events: useRealApi ? createEventsApi(createEventsClient()) : mockEventsApi,
  media: mediaApi,
  feed: useRealApi ? createFeedApi(createEventsClient()) : mockFeedApi,
  interactions: useRealApi
    ? createInteractionsApi(createInteractionsClient())
    : mockInteractionsApi,
  users: mockUsersApi,
  chat: useRealApi ? createChatApi(createChatClient()) : mockChatApi,
  notification: mockNotificationApi,
  // media: useMockApi ? mockMediaApi : createMediaApi(createMediaClient()),
  // feed: useMockApi ? mockFeedApi : createFeedApi(createFeedClient()),
  // users: useRealApi ? createUsersApi(createUsersClient()) : mockUsersApi,
}

// Export sync function for WebSocket cross-tab message synchronization
export function syncWebSocketMessage(
  message: Message,
  conversation: Conversation,
  currentUserId?: string
) {
  if (!useRealApi) {
    syncMessageFromWebSocket(message, conversation, currentUserId)
  }
}
