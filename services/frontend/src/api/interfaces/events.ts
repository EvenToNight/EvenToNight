import type { Tag, Event } from '../types/events'

export interface TagCategory {
  category: string
  tags: Tag[]
}

export type GetTagResponse = TagCategory[]

export interface GetEventByIdRequest {
  eventId: string
}
export interface GetEventByIdResponse {
  event: Event
}
export interface EventAPI {
  getTags(): Promise<GetTagResponse>
  getEventById(request: GetEventByIdRequest): Promise<GetEventByIdResponse>
}
