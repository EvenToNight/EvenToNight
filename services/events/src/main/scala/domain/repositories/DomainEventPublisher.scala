package domain.repositories

import domain.events.DomainEvent

trait DomainEventPublisher:

  def publish(event: DomainEvent): Unit

  def publishAll(events: List[DomainEvent]): Unit =
    events.foreach(publish)
