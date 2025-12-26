package domain.events

import java.time.Instant

sealed trait DomainEvent:
  val timestamp: Instant

case class EventPublished(
    timestamp: Instant,
    eventId: String,
    creatorId: String,
    collaboratorIds: Option[List[String]]
) extends DomainEvent

case class EventUpdated(
    timestamp: Instant,
    eventId: String
) extends DomainEvent

case class EventDeleted(
    timestamp: Instant,
    eventId: String
) extends DomainEvent
