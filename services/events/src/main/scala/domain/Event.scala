package domain
import domain.Commands.CreateEventDraftCommand
import org.bson.Document

import java.time.LocalDateTime
import java.util.UUID
import scala.jdk.CollectionConverters._

case class Event(
    _id: String,
    title: String,
    description: String,
    poster: String,
    tag: List[EventTag],
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
      _id = newId,
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
      eventId = newId
    )

    (newEvent, eventDraftCreated)

  extension (event: Event)
    def toDocument: Document = {
      new Document()
        .append("_id", event._id)
        .append("title", event.title)
        .append("description", event.description)
        .append("poster", event.poster)
        .append("tag", event.tag.map(_.toString).asJava)
        .append("location", event.location)
        .append("date", event.date.toString)
        .append("status", event.status.toString)
        .append("instant", event.instant.toString)
        .append("id_creator", event.id_creator)
        .append("id_collaborator", event.id_collaborator.orNull)
    }
