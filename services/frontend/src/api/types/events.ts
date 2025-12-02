import type { UserID } from './users'
import type { Location } from './common'

export type Tag = string
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export type EventID = string
export interface Event {
  id: EventID
  title: string
  description: string
  posterLink: string
  tags: Tag[]
  location: Location
  date: Date
  price: number
  status: EventStatus
  creatorId: UserID
  collaboratorsId: UserID[]
}
