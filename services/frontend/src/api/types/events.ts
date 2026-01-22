import type { UserID } from './users'
import type { Location } from './common'
import type { EventTicketTypeData } from './payments'

export type Tag = string
export type CreationEventStatus = 'DRAFT' | 'PUBLISHED'
export type EventStatus = CreationEventStatus | 'COMPLETED' | 'CANCELLED'
export type OrganizationRole = 'creator' | 'collaborator'
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
  collaboratorIds: UserID[]
}

export interface Event extends Omit<EventData, 'poster'> {
  eventId: EventID
  poster: string
}

export type PartialEventData = Partial<EventData> & Pick<EventData, 'creatorId' | 'status'>

export type PartialEventDataWithTickets = PartialEventData & {
  ticketTypes: Array<Omit<EventTicketTypeData, 'creatorId'>>
}

export type PartialEventDataWithTicketsForUpdate = PartialEventData & {
  ticketTypes: Array<Omit<EventTicketTypeData, 'creatorId'> & { id: string }>
}
