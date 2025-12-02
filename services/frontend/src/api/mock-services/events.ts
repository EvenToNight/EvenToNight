import type {
  GetEventByIdRequest,
  GetEventByIdResponse,
  GetTagResponse,
} from '../interfaces/events'
import type { EventAPI } from '../interfaces/events'
import { mockEvents } from './data/events'

export const mockEventsApi: EventAPI = {
  async getTags(): Promise<GetTagResponse> {
    return [
      {
        category: 'Music',
        tags: ['Rock', 'Pop', 'Jazz', 'Classical', 'Hip-Hop'],
      },
      {
        category: 'Sports',
        tags: ['Football', 'Basketball', 'Tennis', 'Running', 'Cycling'],
      },
      {
        category: 'Arts',
        tags: ['Painting', 'Sculpture', 'Photography', 'Theater', 'Dance'],
      },
    ]
  },
  async getEventById(request: GetEventByIdRequest): Promise<GetEventByIdResponse> {
    const event = mockEvents.find((event) => event.id === request.eventId)

    if (!event) {
      throw {
        message: `Event ${request.eventId} not found`,
        code: 'EVENT_NOT_FOUND',
        status: 404,
      }
    }

    return { event }
  },
}
