package domain
import domain.Commands.CreateEventDraftCommand

import java.time.LocalDateTime
import java.util.UUID

enum Tag:
  case Concert, Disco, Festival, Sports, Other

case class Event(
    id: String,
    title: String,
    description: String,
    poster: String,
    tag: Tag,
    location: String,
    date: LocalDateTime,
    status: EventStatus,
    instant: java.time.Instant,
    id_creator: String,
    id_collaborator: Option[String]
)

enum EventStatus:
  case DRAFT, PUBLISHED, CANCELLED, COMPLETED

object Event:
  def create(command: CreateEventDraftCommand): (Event, DomainEvent) =

    val newId = UUID.randomUUID().toString

    val newEvent = Event(
      id = newId,
      title = command.title,
      description = command.description,
      poster = command.poster,
      tag = command.tag,
      location = command.location,
      date = command.date,
      status = EventStatus.DRAFT,
      instant = java.time.Instant.now(),
      id_creator = command.id_creator,
      id_collaborator = command.id_collaborator
    )

    val eventDraftCreated = EventDraftCreated(
      id = newId,
      title = command.title,
      description = command.description,
      poster = command.poster,
      tag = command.tag,
      location = command.location,
      date = command.date,
      instant = java.time.Instant.now(),
      id_creator = command.id_creator,
      id_collaborator = command.id_collaborator
    )

    (newEvent, eventDraftCreated)
