import { mockEventsApi } from './mock-services/events'
import { createEventsApi } from './services/events'
import { mediaApi } from './services/media'
import { mockFeedApi } from './mock-services/feed'
import { createFeedApi } from './services/feed'
import { mockInteractionsApi } from './mock-services/interactions'
import { createInteractionsApi } from './services/interactions'
import { mockUsersApi } from './mock-services/users'
// import { createUsersApi } from './services/users'
import {
  createEventsClient,
  createInteractionsClient,
  // createFeedClient,
  // createUsersClient,
} from './client'
import { mockSupportApi } from './mock-services/support'

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
  support: mockSupportApi,
  // media: useMockApi ? mockMediaApi : createMediaApi(createMediaClient()),
  // feed: useMockApi ? mockFeedApi : createFeedApi(createFeedClient()),
  // users: useMockApi ? mockUsersApi : createUsersApi(createUsersClient()),
}
