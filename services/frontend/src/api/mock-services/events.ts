import type {
  GetEventByIdResponse,
  GetTagResponse,
  PublishEventResponse,
  SearchEventsByNameResponse,
} from '../interfaces/events'
import type { EventAPI } from '../interfaces/events'
import type { EventID } from '../types/events'
import { mockEvents } from './data/events'
import type { EventData } from '../types/events'
import { mockTags } from './data/tags'

export const mockEventsApi: EventAPI = {
  async getTags(): Promise<GetTagResponse> {
    return mockTags
  },
  async getEventById(id: EventID): Promise<GetEventByIdResponse> {
    const event = mockEvents.find((event) => event.id === id)

    if (!event) {
      throw {
        message: `Event ${id} not found`,
        code: 'EVENT_NOT_FOUND',
        status: 404,
      }
    }

    return { event }
  },
  async publishEvent(_eventData: EventData): Promise<PublishEventResponse> {
    return { eventId: mockEvents[0]!.id }
  },
  async searchByName(query: string): Promise<SearchEventsByNameResponse> {
    if (!query || query.trim().length === 0) {
      return { events: [] }
    }

    const lowerQuery = query.toLowerCase().trim()
    const publishedEvents = mockEvents.filter((e) => e.status === 'published')

    const matchedEvents = publishedEvents.filter((event) => {
      return event.title.toLowerCase().includes(lowerQuery)
    })

    return { events: matchedEvents }
  },
}
