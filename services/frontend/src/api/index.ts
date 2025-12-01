import { mockEventsApi } from './mock/events'
import { eventsApi } from './services/events'
import { mockImagesApi } from './mock/media'
import { imagesApi } from './services/media'
import { mockUsersApi } from './mock/users'
import { usersApi } from './services/users'
import { mockFeedApi } from './mock/feed'
import { feedApi } from './services/feed'

const isDev = import.meta.env.DEV
export const api = {
  events: isDev ? mockEventsApi : eventsApi,
  images: isDev ? mockImagesApi : imagesApi,
  users: isDev ? mockUsersApi : usersApi,
  feed: isDev ? mockFeedApi : feedApi,
}
