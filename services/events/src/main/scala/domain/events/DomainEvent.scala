package domain.events

import java.time.Instant

sealed trait DomainEvent:
  val id: String
  val timestamp: Instant

case class EventCreated(
    id: String,
    timestamp: Instant,
    id_event: String
) extends DomainEvent

case class EventPublished(
    id: String,
    timestamp: Instant,
    id_event: String
) extends DomainEvent
