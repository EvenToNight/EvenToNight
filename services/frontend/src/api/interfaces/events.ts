import type { Tag, Event, EventID, EventData, EventStatus } from '../types/events'
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

export interface EventAPI {
  getTags(): Promise<GetTagResponse>
  getEventById(id: EventID): Promise<GetEventByIdResponse>
  getEventsByIds(ids: EventID[]): Promise<EventsDataResponse>
  publishEvent(eventData: EventData): Promise<PublishEventResponse>
  updateEventData(eventId: EventID, eventData: EventData): Promise<void>
  updateEventPoster(eventId: EventID, poster: File): Promise<void>
  searchByName(query: string): Promise<EventsDataResponse>
  getEventsByUserIdAndStatus(userId: UserID, status: EventStatus): Promise<EventsDataResponse>
}
