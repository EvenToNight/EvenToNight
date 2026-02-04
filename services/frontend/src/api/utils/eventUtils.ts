import type { Event, EventStatus } from '@/api/types/events'
import type { PaginatedRequest, PaginatedResponse, SortOrder } from '../interfaces/commons'
import type { UserID } from '../types/users'
import { api } from '..'
import type { EventsQueryParams } from '../interfaces/events'
import { createLogger } from '@/utils/logger'

const logger = createLogger(import.meta.url)
export interface EventLoadResult extends Event {
  liked?: boolean
}
export const loadEvents = async (
  params: EventsQueryParams & { userId?: UserID }
): Promise<PaginatedResponse<EventLoadResult>> => {
  logger.log(
    'Loading events for user:',
    params.userId,
    'status:',
    params.status,
    'organizerId:',
    params.organizationId
  )
  const { userId, ...restParams } = params
  const rawResponse = await api.events.searchEvents({
    ...restParams,
  })
  const response = await Promise.all(
    rawResponse.items.map(async (event) => {
      const isLiked = params.userId
        ? await api.interactions.userLikesEvent(event.eventId, params.userId)
        : false
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
  currentUserId: UserID | undefined,
  eventStatus: EventStatus,
  order: SortOrder,
  pagination?: PaginatedRequest
): Promise<PaginatedResponse<EventLoadResult>> => {
  const rawResponse = await api.interactions.userParticipations(userId, {
    pagination: pagination,
    eventStatus,
    order,
  })
  const response = await Promise.all(
    rawResponse.items.map(async (partecipationInfo) => {
      const event = await api.events.getEventById(partecipationInfo.eventId)
      const isLiked = currentUserId
        ? await api.interactions.userLikesEvent(event.eventId, currentUserId)
        : false
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
  currentUserId: UserID | undefined,
  pagination?: PaginatedRequest
): Promise<PaginatedResponse<EventLoadResult>> => {
  const response = await api.interactions.getUserLikedEvents(userId, pagination)
  const events: Event[] = await api.events.getEventsByIds(response.items)

  return {
    ...response,
    items: await Promise.all(
      events.map(async (event) => {
        const isLiked = currentUserId
          ? await api.interactions.userLikesEvent(event.eventId, currentUserId)
          : false
        return {
          ...event,
          liked: isLiked,
        }
      })
    ),
  }
}
