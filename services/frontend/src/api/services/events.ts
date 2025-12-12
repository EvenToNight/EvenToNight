import type { ApiClient } from '../client'
import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  EventsDataResponse,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID, EventData } from '../types/events'
import { buildQueryParams } from '../utils'

export const createEventsApi = (eventsClient: ApiClient): EventAPI => ({
  async getTags(): Promise<GetTagResponse> {
    return eventsClient.get<GetTagResponse>('/tags')
  },
  async getEventById(id: EventID): Promise<GetEventByIdResponse> {
    return eventsClient.get<GetEventByIdResponse>(`/${id}`)
  },
  async getEventsByIds(ids: EventID[]): Promise<EventsDataResponse> {
    const eventsResponses = await Promise.all(ids.map((id) => this.getEventById(id)))
    return { events: eventsResponses }
  },
  async publishEvent(eventData: EventData): Promise<PublishEventResponse> {
    const { poster, date, ...rest } = eventData
    const formData = new FormData()
    formData.append('poster', poster)
    const backendEventData = {
      ...rest,
      date: date.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    formData.append('event', JSON.stringify(backendEventData))
    return eventsClient.post<{ id_event: string }>('/', formData)
  },
  async searchByName(query: string): Promise<EventsDataResponse> {
    return eventsClient.get<EventsDataResponse>(`/${buildQueryParams({ query })}`)
  },
  async getEventsByUserIdAndStatus(userId: string, status: string): Promise<EventsDataResponse> {
    return eventsClient.get<EventsDataResponse>(`/${buildQueryParams({ userId, status })}`)
  },
})
