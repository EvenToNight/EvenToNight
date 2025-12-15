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
import { getPaginatedItems } from '../utils'
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
  async searchByName(
    title: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    const lowerTitle = title.toLowerCase().trim()
    const publishedEvents = mockEvents.filter((e) => e.status === 'PUBLISHED')
    const matchedEvents = publishedEvents.filter((event) => {
      return event.title.toLowerCase().includes(lowerTitle)
    })
    return getPaginatedItems(matchedEvents, pagination)
  },
  async getEventsByUserIdAndStatus(
    id_organization: UserID,
    status: EventStatus,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    const eventsByUserIdAndStatus = mockEvents.filter(
      (event) =>
        (event.id_creator === id_organization ||
          event.id_collaborators.includes(id_organization)) &&
        event.status === status
    )
    return getPaginatedItems(eventsByUserIdAndStatus, pagination)
  },
}
