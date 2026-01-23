package infrastructure.rabbitmq

import com.rabbitmq.client.AMQP
import io.circe.Encoder
import io.circe.generic.semiauto._
import io.circe.syntax._
import model.events.DomainEvent
import model.events.EventEnvelope
import model.events.UserCreated
import model.events.UserDeleted
import model.events.UserUpdated
given eventEnvelopeEncoder[T <: DomainEvent](using enc: Encoder[T]): Encoder[EventEnvelope[T]] =
  deriveEncoder[EventEnvelope[T]]

import java.time.Instant
import scala.jdk.CollectionConverters._

trait EventPublisher:
  def publish(event: DomainEvent): Unit

object EventPublisher:
  def apply(mock: Boolean = false): EventPublisher =
    if mock then new MockEventPublisher()
    else new RabbitEventPublisher()

class MockEventPublisher extends EventPublisher:
  override def publish(event: DomainEvent): Unit =
    println(s"[RABBITMQ MOCK] Published domain event: ${event.getClass.getSimpleName}")

class RabbitEventPublisher() extends EventPublisher:
  val exchangeName: String = RabbitConnection.exchangeName
  override def publish(event: DomainEvent): Unit =
    try
      val key = routingKey(event)
      val envelope = EventEnvelope(
        eventType = key,
        occurredAt = Instant.now(),
        payload = event
      )

      val body = envelope.asJson.noSpaces.getBytes("UTF-8")

      val props = new AMQP.BasicProperties.Builder()
        .contentType("application/json")
        .deliveryMode(2)
        .headers(
          Map(
            "event-type" -> key,
            "producer"   -> "events-service",
            "schema"     -> "1"
          ).asJava
        )
        .build()

      RabbitConnection.channel.basicPublish(
        exchangeName,
        key,
        props,
        body
      )

      println(s"[RABBITMQ] Published $key event to exchange '$exchangeName'")

    catch
      case e: Exception =>
        println(s"[RABBITMQ] Error publishing event: ${e.getMessage}")

  private def routingKey(event: DomainEvent): String = event match
    case _: UserCreated => "user.created"
    case _: UserUpdated => "user.updated"
    case _: UserDeleted => "user.deleted"

  def close(): Unit =
    try
      if RabbitConnection.channel != null && RabbitConnection.channel.isOpen then RabbitConnection.channel.close()
      if RabbitConnection.connection != null && RabbitConnection.connection.isOpen then
        RabbitConnection.connection.close()
      println("[RABBITMQ] Connection closed")
    catch
      case e: Exception =>
        println(s"[RABBITMQ] Error closing connection: ${e.getMessage}")

  sys.addShutdownHook {
    close()
  }
