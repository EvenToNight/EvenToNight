package infrastructure.messaging

import com.rabbitmq.client.*

import scala.compiletime.uninitialized

trait MessageHandler:
  def handle(routingKey: String, message: String): Unit

trait EventConsumer:
  def start(): Unit
  def close(): Unit

class MockEventConsumer() extends EventConsumer:
  override def start(): Unit =
    println("[RABBITMQ MOCK CONSUMER] Started mock consumer")

  override def close(): Unit =
    println("[RABBITMQ MOCK CONSUMER] Closed mock consumer")

class RabbitEventConsumer(
    host: String = "localhost",
    port: Int = 5672,
    username: String = "guest",
    password: String = "guest",
    exchangeName: String = "eventonight",
    queueName: String,
    routingKeys: List[String],
    handler: MessageHandler
) extends EventConsumer:

  private val factory = new ConnectionFactory()
  factory.setHost(host)
  factory.setPort(port)
  factory.setUsername(username)
  factory.setPassword(password)

  private var connection: Connection = uninitialized
  private var channel: Channel       = uninitialized

  override def start(): Unit =
    try
      connection = factory.newConnection()
      channel = connection.createChannel()

      channel.exchangeDeclare(exchangeName, "topic", true)

      channel.queueDeclare(queueName, true, false, false, null)

      routingKeys.foreach { key =>
        channel.queueBind(queueName, exchangeName, key)
        println(s"[RABBITMQ CONSUMER] Bound queue '$queueName' to key '$key'")
      }

      val consumer = new DefaultConsumer(channel):
        override def handleDelivery(
            consumerTag: String,
            envelope: Envelope,
            properties: AMQP.BasicProperties,
            body: Array[Byte]
        ): Unit =
          val routingKey = envelope.getRoutingKey
          val message    = new String(body, "UTF-8")

          try
            handler.handle(routingKey, message)
            channel.basicAck(envelope.getDeliveryTag, false)
            println(s"[RABBITMQ CONSUMER] ✅ Processed: $routingKey")
          catch
            case e: Exception =>
              println(s"[RABBITMQ CONSUMER] ❌ Error processing $routingKey: ${e.getMessage}")
              channel.basicAck(envelope.getDeliveryTag, false)

      channel.basicConsume(queueName, false, consumer)
      println(s"[RABBITMQ CONSUMER] 🎧 Started consuming from queue: $queueName")

    catch
      case e: Exception =>
        println(s"[RABBITMQ CONSUMER] Failed to start: ${e.getMessage}")

  override def close(): Unit =
    try
      if channel != null && channel.isOpen then channel.close()
      if connection != null && connection.isOpen then connection.close()
      println("[RABBITMQ CONSUMER] Connection closed")
    catch
      case e: Exception =>
        println(s"[RABBITMQ CONSUMER] Error closing connection: ${e.getMessage}")

  sys.addShutdownHook {
    close()
  }
