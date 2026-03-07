package domain.events

import java.time.Instant

case class EventEnvelope[T <: DomainEvent](
    eventType: String,
    occurredAt: Instant,
    payload: T
)
