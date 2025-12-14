import type {
  GetEventByIdResponse,
  GetTagResponse,
  PublishEventResponse,
  EventsDataResponse,
} from '../interfaces/events'
import type { EventAPI } from '../interfaces/events'
import type { EventID, EventStatus, PartialEventData } from '../types/events'
import { mockEvents } from './data/events'
import { mockTags } from './data/tags'
import type { UserID } from '../types/users'

export const mockEventsApi: EventAPI = {
  async getTags(): Promise<GetTagResponse> {
    return mockTags
  },
  async getEventById(id: EventID): Promise<GetEventByIdResponse> {
    const event = mockEvents.find((event) => event.id_event === id)

    if (!event) {
      throw {
        message: `Event ${id} not found`,
        code: 'EVENT_NOT_FOUND',
        status: 404,
      }
    }

    return event
  },
  async getEventsByIds(ids: EventID[]): Promise<EventsDataResponse> {
    const events = await Promise.all(ids.map((id) => this.getEventById(id)))
    return { events }
  },
  async publishEvent(_eventData: PartialEventData): Promise<PublishEventResponse> {
    return { id_event: mockEvents[0]!.id_event }
  },
  async updateEventData(_id_event: EventID, _eventData: PartialEventData): Promise<void> {
    return
  },
  async updateEventPoster(_id_event: EventID, _poster: File): Promise<void> {
    return
  },
  async deleteEvent(_id_event: EventID): Promise<void> {
    return
  },
  async searchByName(query: string): Promise<EventsDataResponse> {
    if (!query || query.trim().length === 0) {
      return { events: [] }
    }

    const lowerQuery = query.toLowerCase().trim()
    const publishedEvents = mockEvents.filter((e) => e.status === 'PUBLISHED')

    const matchedEvents = publishedEvents.filter((event) => {
      return event.title.toLowerCase().includes(lowerQuery)
    })

    return { events: matchedEvents }
  },
  async getEventsByUserIdAndStatus(
    userId: UserID,
    status: EventStatus
  ): Promise<EventsDataResponse> {
    const userEvents = mockEvents.filter(
      (event) => event.id_creator === userId && event.status === status
    )
    return { events: userEvents }
  },
}
