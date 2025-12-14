import type { ApiClient } from '../client'
import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  EventsDataResponse,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID, PartialEventData } from '../types/events'
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
  async publishEvent(eventData: PartialEventData): Promise<PublishEventResponse> {
    const { poster, date, ...rest } = eventData
    const formData = new FormData()
    if (poster) {
      formData.append('poster', poster)
    }
    const backendEventData = {
      ...rest,
      date: date?.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    console.log('publishEvent backendEventData', backendEventData)
    formData.append('event', JSON.stringify(backendEventData))
    return eventsClient.post<{ id_event: string }>('/', formData)
  },
  async updateEventData(eventId: EventID, eventData: PartialEventData): Promise<void> {
    const { poster, date, ...rest } = eventData
    const backendEventData = {
      ...rest,
      date: date?.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    console.log('updateEventData backendEventData', backendEventData)
    await eventsClient.put(`/${eventId}`, backendEventData)
  },
  async updateEventPoster(eventId: EventID, poster: File): Promise<void> {
    const formData = new FormData()
    formData.append('poster', poster)
    await eventsClient.post(`/${eventId}/poster`, formData)
  },
  async deleteEvent(eventId: EventID): Promise<void> {
    await eventsClient.delete(`/${eventId}`)
  },
  async searchByName(id_organization: string): Promise<EventsDataResponse> {
    return eventsClient.get<EventsDataResponse>(
      `/search${buildQueryParams({ id_organization, limit: 10 })}`
    )
  },
  async getEventsByUserIdAndStatus(
    id_organization: string,
    status: string
  ): Promise<EventsDataResponse> {
    return eventsClient.get<EventsDataResponse>(
      `/search${buildQueryParams({ id_organization, status, limit: 10 })}`
    )
  },
})
