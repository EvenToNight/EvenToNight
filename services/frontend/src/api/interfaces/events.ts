import type { Tag, Event, EventID, EventData } from '../types/events'

export interface TagCategory {
  category: string
  tags: Tag[]
}

export type GetTagResponse = TagCategory[]

export interface GetEventByIdResponse {
  event: Event
}

export interface PublishEventResponse {
  eventId: EventID
}

export interface SearchEventsByNameResponse {
  events: Event[]
}

export interface EventAPI {
  getTags(): Promise<GetTagResponse>
  getEventById(id: EventID): Promise<GetEventByIdResponse>
  publishEvent(eventData: EventData): Promise<PublishEventResponse>
  searchByName(query: string): Promise<SearchEventsByNameResponse>
}
