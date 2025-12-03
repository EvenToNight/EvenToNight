import type { UserID } from './users'
import type { Location } from './common'

export type Tag = string
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export type EventID = string

export interface EventData {
  title: string
  description: string
  poster: File
  tags: Tag[]
  location: Location
  date: Date
  price: number
  status: EventStatus
  creatorId: UserID
  collaboratorsId: UserID[]
}

export interface Event extends Omit<EventData, 'poster'> {
  id: EventID
  posterLink: string
}
