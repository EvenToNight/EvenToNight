import type { EventID } from '@/api/types/events'
import { mockEvents } from './events'

export const mockFeed: EventID[] = mockEvents.map((event) => event.id)
