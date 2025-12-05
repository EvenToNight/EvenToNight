import { mockEventsApi } from './mock-services/events'
import { createEventsApi } from './services/events'
import { mockMediaApi } from './mock-services/media'
import { createMediaApi } from './services/media'
import { mockFeedApi } from './mock-services/feed'
import { createFeedApi } from './services/feed'
import { mockInteractionsApi } from './mock-services/interactions'
import { createInteractionsApi } from './services/interactions'
import { mockUsersApi } from './mock-services/users'
import { createUsersApi } from './services/users'
import {
  createEventsClient,
  createFeedClient,
  createInteractionsClient,
  createMediaClient,
  createUsersClient,
} from './client'

const useMockApi = import.meta.env.VITE_USE_MOCK_API
  ? import.meta.env.VITE_USE_MOCK_API === 'true'
  : import.meta.env.DEV

export const api = {
  events: useMockApi ? mockEventsApi : createEventsApi(createEventsClient()),
  media: useMockApi ? mockMediaApi : createMediaApi(createMediaClient()),
  feed: useMockApi ? mockFeedApi : createFeedApi(createFeedClient()),
  interactions: useMockApi
    ? mockInteractionsApi
    : createInteractionsApi(createInteractionsClient()),
  users: useMockApi ? mockUsersApi : createUsersApi(createUsersClient()),
}
