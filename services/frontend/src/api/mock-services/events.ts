import type {
  GetEventByIdResponse,
  GetTagResponse,
  PublishEventResponse,
  EventsDataResponse,
  EventsQueryParams,
} from '../interfaces/events'
import type { EventAPI } from '../interfaces/events'
import type { EventID, PartialEventData, Event } from '../types/events'
import { mockEvents } from './data/events'
import { mockTags } from './data/tags'
import { getPaginatedItems } from '../utils/requestUtils'
import type { PaginatedResponse } from '../interfaces/commons'

export const mockEventsApi: EventAPI = {
  async getTags(): Promise<GetTagResponse> {
    return mockTags
  },
  async getEventById(eventId: EventID): Promise<GetEventByIdResponse> {
    const event = mockEvents.find((event) => event.eventId === eventId)

    if (!event) {
      throw {
        message: `Event ${eventId} not found`,
        code: 'EVENT_NOT_FOUND',
        status: 404,
      }
    }

    return event
  },
  async getEventsByIds(eventIds: EventID[]): Promise<EventsDataResponse> {
    return await Promise.all(eventIds.map((eventId) => this.getEventById(eventId)))
  },
  async createEvent(_eventData: PartialEventData): Promise<PublishEventResponse> {
    return { eventId: mockEvents[0]!.eventId }
  },
  async updateEventData(_eventId: EventID, _eventData: PartialEventData): Promise<void> {
    return
  },
  async updateEventPoster(_eventId: EventID, _poster: File): Promise<void> {
    return
  },
  async deleteEventPoster(_eventId: EventID): Promise<void> {
    return
  },
  async deleteEvent(_eventId: EventID): Promise<void> {
    return
  },
  async searchEvents(params: EventsQueryParams): Promise<PaginatedResponse<Event>> {
    const lowerTitle = (params.title ?? '').toLowerCase().trim()
    const status = params.status ?? 'PUBLISHED'

    const events = mockEvents
      .filter((event) => event.status === status)
      .filter((event) => {
        return event.title.toLowerCase().includes(lowerTitle)
      })
      .filter((event) => {
        return (
          !params.organizationId ||
          event.creatorId === params.organizationId ||
          event.collaboratorIds.includes(params.organizationId)
        )
      })
    return getPaginatedItems(events, params.pagination)
  },
}
