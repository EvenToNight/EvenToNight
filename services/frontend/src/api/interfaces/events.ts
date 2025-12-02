import type { Tag, Event, EventID } from '../types/events'

export interface TagCategory {
  category: string
  tags: Tag[]
}

export type GetTagResponse = TagCategory[]

export interface GetEventByIdResponse {
  event: Event
}

export interface EventAPI {
  getTags(): Promise<GetTagResponse>
  getEventById(id: EventID): Promise<GetEventByIdResponse>
}
