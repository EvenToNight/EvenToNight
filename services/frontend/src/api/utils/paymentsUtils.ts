import type { PaginatedRequest, PaginatedResponse, SortOrder } from '../interfaces/commons'
import type { Event } from '../types/events'
import { api } from '@/api'
import type { UserID } from '../types/users'
import { emptyPaginatedResponse } from './requestUtils'
import type { TicketRequestEventStatus } from '../interfaces/payments'

export const loadUserEventParticipations = async (
  userId: UserID,
  pagination?: PaginatedRequest,
  options?: {
    eventStatus?: TicketRequestEventStatus
    sortOrder?: SortOrder
  }
): Promise<PaginatedResponse<Event>> => {
  const { eventStatus = 'PUBLISHED', sortOrder = 'asc' } = options || {}

  const response = await api.payments.findEventsWithUserTickets(userId, {
    status: eventStatus,
    order: sortOrder,
    pagination,
  })

  if (response.items.length > 0) {
    const eventsData = await api.events.getEventsByIds(response.items)
    return {
      items: eventsData,
      limit: response.limit,
      offset: response.offset,
      hasMore: response.hasMore,
    }
  }

  return emptyPaginatedResponse<Event>()
}
