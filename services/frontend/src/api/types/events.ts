import type { UserID } from './users'
import type { Location } from './common'

export type Tag = string
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'

export type EventID = string

export interface EventData {
  title: string
  description: string
  poster: File
  tags: Tag[]
  location: Location
  date: Date // send ISO 8601 format to backend
  price: number
  status: EventStatus
  id_creator: UserID
  id_collaborators: UserID[]
}

export interface Event extends Omit<EventData, 'poster'> {
  id_event: EventID
  poster: string
}
