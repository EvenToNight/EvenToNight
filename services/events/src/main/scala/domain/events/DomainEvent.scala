package domain.events
import io.circe.Encoder
import io.circe.generic.semiauto.*

import java.time.LocalDateTime

sealed trait DomainEvent

object DomainEvent:
  implicit val encoder: Encoder[DomainEvent] = Encoder.instance {
    case event: EventCreated     => deriveEncoder[EventCreated].apply(event)
    case event: EventPublished   => deriveEncoder[EventPublished].apply(event)
    case event: EventUpdated     => deriveEncoder[EventUpdated].apply(event)
    case event: EventDeleted     => deriveEncoder[EventDeleted].apply(event)
    case event: EventCompleted   => deriveEncoder[EventCompleted].apply(event)
    case EventCancelled(eventId) => deriveEncoder[EventCancelled].apply(EventCancelled(eventId))
  }

case class EventCreated(
    eventId: String,
    creatorId: String,
    collaboratorIds: Option[List[String]],
    name: Option[String],
    date: Option[LocalDateTime],
    status: String
) extends DomainEvent

case class EventPublished(
    eventId: String
) extends DomainEvent

case class EventUpdated(
    eventId: String,
    collaboratorIds: Option[List[String]],
    name: Option[String],
    date: Option[LocalDateTime],
    status: String
) extends DomainEvent

case class EventDeleted(
    eventId: String
) extends DomainEvent

case class EventCancelled(
    eventId: String
) extends DomainEvent

case class EventCompleted(
    eventId: String
) extends DomainEvent
