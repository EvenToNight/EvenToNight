package infrastructure.messaging
import com.rabbitmq.client.{AMQP, Channel, Connection, ConnectionFactory}
import domain.events.{DomainEvent, EventDeleted, EventPublished, EventUpdated}
import io.circe.generic.auto.*
import io.circe.syntax.*

import scala.compiletime.uninitialized
import scala.jdk.CollectionConverters.*

trait EventPublisher:
  def publish(event: DomainEvent): Unit

class MockEventPublisher extends EventPublisher:
  override def publish(event: DomainEvent): Unit =
    println(s"[RABBITMQ MOCK] Published domain event: ${event.getClass.getSimpleName}")

class RabbitEventPublisher(
    host: String = "localhost",
    port: Int = 5672,
    username: String = "guest",
    password: String = "guest",
    exchangeName: String = "events"
) extends EventPublisher:

  private val factory = new ConnectionFactory()
  factory.setHost(host)
  factory.setPort(port)
  factory.setUsername(username)
  factory.setPassword(password)

  private var connection: Connection = uninitialized
  private var channel: Channel       = uninitialized

  initialize()

  private def initialize(): Unit =
    try
      connection = factory.newConnection()
      channel = connection.createChannel()
      channel.exchangeDeclare(exchangeName, "topic", true)
      println(s"[RABBITMQ] Connected to RabbitMQ at $host:$port")
    catch
      case e: Exception =>
        println(s"[RABBITMQ] Failed to connect: ${e.getMessage}")

  override def publish(event: DomainEvent): Unit =
    try
      val key  = routingKey(event)
      val body = event.asJson.noSpaces.getBytes("UTF-8")

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

      channel.basicPublish(exchangeName, key, props, body)

      println(s"[RABBITMQ] Published $key")
    catch
      case e: Exception =>
        println(s"[RABBITMQ] Error publishing event: ${e.getMessage}")

  private def routingKey(event: DomainEvent): String = event match
    case _: EventPublished => "event.published"
    case _: EventUpdated   => "event.updated"
    case _: EventDeleted   => "event.deleted"

  def close(): Unit =
    try
      if channel != null && channel.isOpen then channel.close()
      if connection != null && connection.isOpen then connection.close()
      println("[RABBITMQ] Connection closed")
    catch
      case e: Exception =>
        println(s"[RABBITMQ] Error closing connection: ${e.getMessage}")

  sys.addShutdownHook {
    close()
  }
