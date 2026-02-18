package infrastructure.adapters

import domain.events.DomainEvent
import domain.repositories.DomainEventPublisher
import infrastructure.messaging.EventPublisher

class DomainEventPublisherAdapter(private val eventPublisher: EventPublisher)
    extends DomainEventPublisher:

  override def publish(event: DomainEvent): Unit =
    eventPublisher.publish(event)

  override def publishAll(events: List[DomainEvent]): Unit =
    events.foreach(eventPublisher.publish)
