import type { Tag, Event, EventID, PartialEventData, EventStatus } from '../types/events'
import type { UserID } from '../types/users'
import type { PaginatedRequest } from './commons'

export interface TagCategory {
  category: string
  tags: Tag[]
}

export type GetTagResponse = TagCategory[]

export type GetEventByIdResponse = Event

export interface PublishEventResponse {
  id_event: EventID
}

export interface EventsDataResponse {
  events: Event[]
}

export interface EventPaginatedResponse {
  events: Event[]
  limit: number
  offset: number
  hasMore: boolean
}

export interface EventAPI {
  getTags(): Promise<GetTagResponse>
  getEventById(id_event: EventID): Promise<GetEventByIdResponse>
  getEventsByIds(id_events: EventID[]): Promise<EventsDataResponse>
  publishEvent(eventData: PartialEventData): Promise<PublishEventResponse>
  updateEventData(id_event: EventID, eventData: PartialEventData): Promise<void>
  updateEventPoster(id_event: EventID, poster: File): Promise<void>
  deleteEvent(id_event: EventID): Promise<void>
  searchByName(title: string, pagination?: PaginatedRequest): Promise<EventPaginatedResponse>
  getEventsByUserIdAndStatus(
    id_organization: UserID,
    status: EventStatus,
    pagination?: PaginatedRequest
  ): Promise<EventPaginatedResponse>
}
