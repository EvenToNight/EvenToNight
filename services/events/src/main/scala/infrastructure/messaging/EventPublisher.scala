package infrastructure.messaging
import com.rabbitmq.client.{Channel, Connection, ConnectionFactory}
import domain.events.DomainEvent

import scala.compiletime.uninitialized
import scala.util.Try

trait EventPublisher:
  def publish(event: DomainEvent): Unit

class MockEventPublisher extends EventPublisher:
  override def publish(event: DomainEvent): Unit =
    val eventType = event.getClass.getSimpleName
    println(s"[RABBITMQ MOCK] Published domain event: $eventType (ID: ${event.id})")

class RabbitEventPublisher(
    host: String = "localhost",
    port: Int = 5672,
    username: String = "guest",
    password: String = "guest",
    exchangeName: String = "events"
) extends EventPublisher:

  private val factory: ConnectionFactory = new ConnectionFactory()
  factory.setHost(host)
  factory.setPort(port)
  factory.setUsername(username)
  factory.setPassword(password)

  private var connection: Connection = uninitialized
  private var channel: Channel       = uninitialized

  initialize()

  private def initialize(): Unit =
    val initTry = Try {
      connection = factory.newConnection()
      channel = connection.createChannel()

      channel.exchangeDeclare(exchangeName, "topic", true)

      println(s"[RABBITMQ] Connected to RabbitMQ at $host:$port")
    }

    initTry.get

  override def publish(event: DomainEvent): Unit =
    val publishTry = Try {
      val eventType  = event.getClass.getSimpleName
      val routingKey = s"event.${eventType.toLowerCase}"
      val message    = s"Event: $eventType - ID: ${event.id}"

      channel.basicPublish(
        exchangeName,
        routingKey,
        null,
        message.getBytes("UTF-8")
      )

      println(
        s"[RABBITMQ] Published event: $eventType (ID: ${event.id}) to exchange '$exchangeName' with routing key '$routingKey'"
      )
    }

    if publishTry.isFailure then
      println(s"[RABBITMQ] Failed to publish event: ${publishTry.failed.get.getMessage}")

    publishTry.get

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
