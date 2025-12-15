import type {
  GetEventByIdResponse,
  GetTagResponse,
  PublishEventResponse,
  EventsDataResponse,
} from '../interfaces/events'
import type { EventAPI } from '../interfaces/events'
import type { EventID, EventStatus, PartialEventData, Event } from '../types/events'
import { mockEvents } from './data/events'
import { mockTags } from './data/tags'
import type { UserID } from '../types/users'
import type { PaginatedRequest } from '../interfaces/commons'
import { getPaginatedItems } from '../utils/requestUtils'
import type { PaginatedResponse } from '../interfaces/commons'

export const mockEventsApi: EventAPI = {
  async getTags(): Promise<GetTagResponse> {
    return mockTags
  },
  async getEventById(id_event: EventID): Promise<GetEventByIdResponse> {
    const event = mockEvents.find((event) => event.id_event === id_event)

    if (!event) {
      throw {
        message: `Event ${id_event} not found`,
        code: 'EVENT_NOT_FOUND',
        status: 404,
      }
    }

    return event
  },
  async getEventsByIds(id_events: EventID[]): Promise<EventsDataResponse> {
    const events = await Promise.all(id_events.map((id_event) => this.getEventById(id_event)))
    return { events }
  },
  async createEvent(_eventData: PartialEventData): Promise<PublishEventResponse> {
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
  async searchEvents(params: {
    title?: string
    pagination?: PaginatedRequest
    id_organization?: UserID
    status?: EventStatus
  }): Promise<PaginatedResponse<Event>> {
    const lowerTitle = (params.title ?? '').toLowerCase().trim()
    const status = params.status ?? 'PUBLISHED'

    const events = mockEvents
      .filter((event) => event.status === status)
      .filter((event) => {
        return event.title.toLowerCase().includes(lowerTitle)
      })
      .filter((event) => {
        return (
          !params.id_organization ||
          event.id_creator === params.id_organization ||
          event.id_collaborators.includes(params.id_organization)
        )
      })
    return getPaginatedItems(events, params.pagination)
  },
}
