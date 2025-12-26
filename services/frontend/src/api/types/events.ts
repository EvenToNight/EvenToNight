import type { UserID } from './users'
import type { Location } from './common'

export type Tag = string
export type CreationEventStatus = 'DRAFT' | 'PUBLISHED'
export type EventStatus = CreationEventStatus | 'COMPLETED' | 'CANCELLED'

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
  creatorId: UserID
  id_collaborators: UserID[]
}

export interface Event extends Omit<EventData, 'poster'> {
  eventId: EventID
  poster: string
}

export type PartialEventData = Partial<EventData> & Pick<EventData, 'creatorId' | 'status'>
