import type { Event, EventStatus } from '@/api/types/events'
import type { PaginatedRequest, PaginatedResponse, SortOrder } from '../interfaces/commons'
import type { UserID } from '../types/users'
import { api } from '..'

export interface EventLoadResult extends Event {
  liked?: boolean
}

export const loadEvents = async (
  userId: UserID,
  status: EventStatus,
  sortOrder: SortOrder,
  pagination?: PaginatedRequest
): Promise<PaginatedResponse<EventLoadResult>> => {
  console.log('Loading events for user:', userId, 'status:', status)
  const rawResponse = await api.events.searchEvents({
    organizationId: userId,
    status: status,
    sortBy: 'date',
    sortOrder: sortOrder,
    pagination: pagination,
  })
  const response = await Promise.all(
    rawResponse.items.map(async (event) => {
      const isLiked = await api.interactions.userLikesEvent(event.eventId, userId)
      return { ...event, liked: isLiked }
    })
  )
  return {
    items: response,
    hasMore: rawResponse.hasMore,
    limit: rawResponse.limit,
    offset: rawResponse.offset,
  }
}

export const loadEventParticipations = async (
  userId: UserID,
  _status: EventStatus,
  _sortOrder: SortOrder,
  pagination?: PaginatedRequest
): Promise<PaginatedResponse<EventLoadResult>> => {
  const rawResponse = await api.interactions.userParticipations(userId, {
    pagination: pagination,
  })
  const response = await Promise.all(
    rawResponse.items.map(async (partecipationInfo) => {
      const event = await api.events.getEventById(partecipationInfo.eventId)
      const isLiked = await api.interactions.userLikesEvent(event.eventId, userId)
      return { ...event, liked: isLiked }
    })
  )
  return {
    items: response,
    hasMore: rawResponse.hasMore,
    limit: rawResponse.limit,
    offset: rawResponse.offset,
  }
}

export const loadLikedEvents = async (
  userId: UserID,
  pagination?: PaginatedRequest
): Promise<PaginatedResponse<EventLoadResult>> => {
  const response = await api.interactions.getUserLikedEvents(userId, pagination)
  const events: Event[] = await api.events.getEventsByIds(response.items)

  return {
    items: events.map((event) => ({
      ...event,
      liked: true,
    })),
    hasMore: response.hasMore,
    limit: response.limit,
    offset: response.offset,
  }
}
