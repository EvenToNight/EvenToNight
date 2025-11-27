package domain

trait DomainEvent {
  val id: String                   = java.util.UUID.randomUUID().toString
  val timestamp: java.time.Instant = java.time.Instant.now()
}

case class EventDraftCreated(
    eventId: String
) extends DomainEvent
