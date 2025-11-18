package infrastructure.messaging
import domain.messaging.DomainEvent

trait EventPublisher {
  def publish(event: DomainEvent): Unit
}

class MockEventPublisher extends EventPublisher {
  override def publish(event: DomainEvent): Unit = {
    val eventType = event.getClass.getSimpleName
    println(s"[RABBITMQ MOCK] Published domain event: $eventType (ID: ${event.id})")
  }
}
