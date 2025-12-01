import type { GetTagResponse } from '../types/events'

export const mockEventsApi = {
  async getTags(): Promise<GetTagResponse[]> {
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
}
