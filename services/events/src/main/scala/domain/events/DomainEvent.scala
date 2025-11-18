package domain.events

import java.time.Instant

sealed trait DomainEvent {
  val id: String
  val timestamp: Instant
}

case class EventDraftCreated(
    id: String,
    timestamp: Instant,
    eventId: String
) extends DomainEvent
