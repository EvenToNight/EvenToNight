package commons.rabbitmq

import com.rabbitmq.client.Channel
import com.rabbitmq.client.Connection
import com.rabbitmq.client.ConnectionFactory

class RabbitClient(
    host: String,
    port: Int,
    username: String,
    password: String
):

  private val factory = new ConnectionFactory()
  factory.setHost(host)
  factory.setPort(port)
  factory.setUsername(username)
  factory.setPassword(password)

  private val connection: Connection = factory.newConnection()
  def createChannel(): Channel       = connection.createChannel()

  def declareTopicExchange(exchangeName: String): Unit =
    val channel = createChannel()
    try
      channel.exchangeDeclare(exchangeName, "topic", true)
    finally
      if channel.isOpen then channel.close()

  def close(): Unit =
    if connection != null && connection.isOpen then connection.close()

  sys.addShutdownHook(close())
