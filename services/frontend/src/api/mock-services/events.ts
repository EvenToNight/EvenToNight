import type {
  GetEventByIdResponse,
  GetTagResponse,
  PublishEventResponse,
} from '../interfaces/events'
import type { EventAPI } from '../interfaces/events'
import type { EventID } from '../types/events'
import { mockEvents } from './data/events'
import type { EventData } from '../types/events'

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
  async getEventById(id: EventID): Promise<GetEventByIdResponse> {
    const event = mockEvents.find((event) => event.id === id)

    if (!event) {
      throw {
        message: `Event ${id} not found`,
        code: 'EVENT_NOT_FOUND',
        status: 404,
      }
    }

    return { event }
  },
  async publishEvent(_eventData: EventData): Promise<PublishEventResponse> {
    return { eventId: mockEvents[0]!.id }
  },
}
