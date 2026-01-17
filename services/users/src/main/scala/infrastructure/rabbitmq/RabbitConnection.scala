package infrastructure.rabbitmq

import com.rabbitmq.client.Channel
import com.rabbitmq.client.Connection
import com.rabbitmq.client.ConnectionFactory

object RabbitConnection:
  val factory            = new ConnectionFactory()
  val rabbitHost: String = sys.env.getOrElse("RABBITMQ_HOST", "localhost")
  val rabbitPort: Int    = sys.env.getOrElse("RABBITMQ_PORT", "5672").toInt
  val rabbitUser: String = sys.env.getOrElse("RABBITMQ_USER", "guest")
  val rabbitPass: String = sys.env.getOrElse("RABBITMQ_PASS", "guest")
  factory.setHost(rabbitHost)
  factory.setPort(rabbitPort)
  factory.setUsername(rabbitUser)
  factory.setPassword(rabbitPass)
  val connection: Connection = factory.newConnection()
  val channel: Channel       = connection.createChannel()
  val exchangeName: String   = "eventonight"
  channel.exchangeDeclare(exchangeName, "topic", true)
  val eventPublisher = EventPublisher() // Set mock = true to use the mock publisher
