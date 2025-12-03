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

const isDev = import.meta.env.DEV
export const api = {
  events: isDev ? mockEventsApi : createEventsApi(createEventsClient()),
  media: isDev ? mockMediaApi : createMediaApi(createMediaClient()),
  feed: isDev ? mockFeedApi : createFeedApi(createFeedClient()),
  interactions: isDev ? mockInteractionsApi : createInteractionsApi(createInteractionsClient()),
  users: isDev ? mockUsersApi : createUsersApi(createUsersClient()),
}
