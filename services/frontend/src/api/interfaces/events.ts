import type { Tag, Event, EventID, PartialEventData, EventStatus } from '../types/events'
import type { UserID } from '../types/users'
import type { PaginatedRequest, PaginatedResponse, SortOrder } from './commons'

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

export type EventSortOption = 'date' | 'price' | 'title' | 'instant'
export interface EventsQueryParams {
  title?: string
  status?: EventStatus
  tags?: Tag[]
  startDate?: string
  endDate?: string
  id_organization?: UserID
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
  getEventById(id_event: EventID): Promise<GetEventByIdResponse>
  getEventsByIds(id_events: EventID[]): Promise<EventsDataResponse>
  createEvent(eventData: PartialEventData): Promise<PublishEventResponse>
  updateEventData(id_event: EventID, eventData: PartialEventData): Promise<void>
  updateEventPoster(id_event: EventID, poster: File): Promise<void>
  deleteEvent(id_event: EventID): Promise<void>
  searchEvents(params: EventsQueryParams): Promise<PaginatedResponse<Event>>
}
