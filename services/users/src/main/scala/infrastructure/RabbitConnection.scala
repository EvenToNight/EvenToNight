package infrastructure

import com.rabbitmq.client.Channel
import com.rabbitmq.client.Connection
import com.rabbitmq.client.ConnectionFactory

object RabbitConnection:
  val factory = new ConnectionFactory()
  factory.setHost(sys.env.getOrElse("RABBITMQ_HOST", "localhost"))
  factory.setPort(5672) // default RabbitMQ port
  val connection: Connection = factory.newConnection()
  val channel: Channel       = connection.createChannel()

  val queueName = "testQueue"
  channel.queueDeclare(queueName, false, false, false, null)
