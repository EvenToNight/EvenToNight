package infrastructure.messaging

import com.rabbitmq.client.AMQP
import domain.events.DomainEvent
import domain.events.EventEnvelope
import domain.events.UserCreated
import domain.events.UserDeleted
import domain.events.UserUpdated
import io.circe.Encoder
import io.circe.generic.semiauto._
import io.circe.syntax._
given eventEnvelopeEncoder[T <: DomainEvent](using enc: Encoder[T]): Encoder[EventEnvelope[T]] =
  deriveEncoder[EventEnvelope[T]]

import java.time.Instant
import scala.jdk.CollectionConverters._
import commons.rabbitmq.RabbitClient

trait EventPublisher:
  def publish(event: DomainEvent): Unit

object EventPublisher:
  def apply(client: RabbitClient, exchangeName: String): EventPublisher =
    new RabbitEventPublisher(client, exchangeName)
  def mock(): EventPublisher =
    new MockEventPublisher()

class MockEventPublisher extends EventPublisher:
  override def publish(event: DomainEvent) =
    println(s"[RABBITMQ MOCK] Published domain event: ${event.getClass.getSimpleName}")

class RabbitEventPublisher(client: RabbitClient, exchangeName: String) extends EventPublisher:
  override def publish(event: DomainEvent): Unit =
    val channel = client.createChannel()
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

      channel.basicPublish(
        exchangeName,
        key,
        props,
        body
      )

      println(s"[RABBITMQ] Published $key event to exchange '$exchangeName'")

    catch
      case e: Exception =>
        println(s"[RABBITMQ] Error publishing event: ${e.getMessage}")

    finally
      if channel != null && channel.isOpen then channel.close()

  private def routingKey(event: DomainEvent): String = event match
    case _: UserCreated => "user.created"
    case _: UserUpdated => "user.updated"
    case _: UserDeleted => "user.deleted"
