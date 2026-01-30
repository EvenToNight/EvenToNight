import type { Tag, Event, EventID, EventStatus, PartialEventData } from '../types/events'
import type { UserID } from '../types/users'
import type { PaginatedRequest, PaginatedResponse, SortOrder } from './commons'

export interface TagCategory {
  category: string
  tags: Tag[]
}

export type GetTagResponse = TagCategory[]

export type GetEventByIdResponse = Event

export interface PublishEventResponse {
  eventId: EventID
}

export type EventsDataResponse = Event[]

export type EventSortOption = 'date' | 'price' | 'title' | 'instant'
export interface EventsQueryParams {
  title?: string
  status?: EventStatus
  tags?: Tag[]
  startDate?: string
  endDate?: string
  organizationId?: UserID
  city?: string
  location_name?: string
  priceMin?: number
  priceMax?: number
  sortBy?: EventSortOption
  sortOrder?: SortOrder
  pagination?: PaginatedRequest
}

export interface EventAPI {
  getTags(): Promise<GetTagResponse>
  getEventById(eventId: EventID): Promise<GetEventByIdResponse>
  getEventsByIds(eventIds: EventID[]): Promise<EventsDataResponse>
  createEvent(eventData: PartialEventData): Promise<PublishEventResponse>
  updateEventData(eventId: EventID, eventData: PartialEventData): Promise<void>
  updateEventPoster(eventId: EventID, poster: File): Promise<void>
  deleteEventPoster(eventId: EventID): Promise<void>
  deleteEvent(eventId: EventID): Promise<void>
  searchEvents(params: EventsQueryParams): Promise<PaginatedResponse<Event>>
}
