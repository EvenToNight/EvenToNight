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
export type OtherEventFilters = 'upcoming' | 'popular' | 'recently_added' | 'feed'
export interface EventsQueryParams {
  pagination?: PaginatedRequest
  status?: EventStatus | Set<EventStatus>
  title?: string
  tags?: Tag | Set<Tag>
  startDate?: Date
  endDate?: Date
  organizationId?: UserID
  city?: string
  location_name?: string
  query?: string
  sortBy?: EventSortOption
  sortOrder?: SortOrder
  near?: { latitude: number; longitude: number }
  price?: { min: number; max: number }
  other?: OtherEventFilters
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
