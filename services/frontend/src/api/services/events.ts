import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  EventsDataResponse,
  EventsQueryParams,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID, Event, PartialEventData } from '../types/events'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { PaginatedResponse } from '../interfaces/commons'
import type { ApiClient } from '../client'

export const createEventsApi = (eventsClient: ApiClient): EventAPI => ({
  async getTags(): Promise<GetTagResponse> {
    return eventsClient.get<GetTagResponse>('/tags')
  },
  async getEventById(eventId: EventID): Promise<GetEventByIdResponse> {
    console.log('Fetching event by ID2:', eventId)
    return eventsClient.get<GetEventByIdResponse>(`/${eventId}`)
  },
  async getEventsByIds(eventIds: EventID[]): Promise<EventsDataResponse> {
    return await Promise.all(
      eventIds.map((eventId) => {
        console.log('Fetching event for ID:', eventId)
        return this.getEventById(eventId)
      })
    )
  },
  async createEvent(eventData: PartialEventData): Promise<PublishEventResponse> {
    const { poster, date, ...rest } = eventData
    const formData = new FormData()
    if (poster) {
      formData.append('poster', poster)
    }

    const backendEventData = {
      ...rest,
      date: date?.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    formData.append('event', JSON.stringify(backendEventData))
    return await eventsClient.post<PublishEventResponse>('/', formData)
  },
  async updateEventData(eventId: EventID, eventData: PartialEventData): Promise<void> {
    const { poster, date, ...rest } = eventData
    const backendEventData = {
      ...rest,
      date: date?.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    await eventsClient.put(`/${eventId}`, backendEventData)
  },
  async updateEventPoster(eventId: EventID, poster: File): Promise<void> {
    const formData = new FormData()
    formData.append('poster', poster)
    await eventsClient.post(`/${eventId}/poster`, formData)
  },
  async deleteEventPoster(eventId: EventID): Promise<void> {
    await eventsClient.delete(`/${eventId}/poster`)
  },
  async deleteEvent(eventId: EventID): Promise<void> {
    await eventsClient.delete(`/${eventId}`)
  },
  async searchEvents(params: EventsQueryParams): Promise<PaginatedResponse<Event>> {
    const {
      pagination = { ...evaluatePagination(params.pagination) },
      startDate,
      endDate,
      ...rest
    } = params
    const pareseStartDate = startDate?.toISOString().replace(/\.\d{3}Z$/, '')
    const pareseEndDate = endDate?.toISOString().replace(/\.\d{3}Z$/, '')
    return eventsClient.get<PaginatedResponse<Event>>(
      `/search${buildQueryParams({ ...pagination, startDate: pareseStartDate, endDate: pareseEndDate, ...rest })}`
    )
  },
})
