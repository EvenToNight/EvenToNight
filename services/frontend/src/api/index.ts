import { mockEventsApi } from './mock-services/events'
import { eventsApi } from './services/events'
import { mockImagesApi } from './mock-services/media'
import { mediaApi } from './services/media'
import { mockFeedApi } from './mock-services/feed'
import { feedApi } from './services/feed'
import { mockInteractionsApi } from './mock-services/interactions'
import { interactionsApi } from './services/interactions'
import { mockUserApi } from './mock-services/users'
import { userApi } from './services/users'

const isDev = import.meta.env.DEV
export const api = {
  events: isDev ? mockEventsApi : eventsApi,
  images: isDev ? mockImagesApi : mediaApi,
  feed: isDev ? mockFeedApi : feedApi,
  interactions: isDev ? mockInteractionsApi : interactionsApi,
  users: isDev ? mockUserApi : userApi,
}
