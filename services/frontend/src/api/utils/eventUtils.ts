import type { Event } from '@/api/types/events'

export interface EventLoadResult extends Event {
  liked?: boolean
}
