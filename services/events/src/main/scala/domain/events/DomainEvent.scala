package domain.events

import java.time.Instant

sealed trait DomainEvent:
  val id: String
  val timestamp: Instant

case class EventPublished(
    id: String,
    timestamp: Instant,
    eventId: String,
    id_creator: String,
    id_collaborators: Option[List[String]]
) extends DomainEvent

case class EventUpdated(
    id: String,
    timestamp: Instant,
    eventId: String
) extends DomainEvent

case class EventDeleted(
    id: String,
    timestamp: Instant,
    eventId: String
) extends DomainEvent
