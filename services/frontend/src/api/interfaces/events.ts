import type { Tag, Event, EventID, PartialEventData, EventStatus } from '../types/events'
import type { UserID } from '../types/users'

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
  getEventById(id: EventID): Promise<GetEventByIdResponse>
  getEventsByIds(ids: EventID[]): Promise<EventsDataResponse>
  publishEvent(eventData: PartialEventData): Promise<PublishEventResponse>
  updateEventData(eventId: EventID, eventData: PartialEventData): Promise<void>
  updateEventPoster(eventId: EventID, poster: File): Promise<void>
  searchByName(query: string): Promise<EventsDataResponse>
  getEventsByUserIdAndStatus(userId: UserID, status: EventStatus): Promise<EventsDataResponse>
}
