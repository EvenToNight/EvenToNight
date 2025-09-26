import com.rabbitmq.client.{Channel, Connection, ConnectionFactory}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class MainTest extends AnyFlatSpec with Matchers:
  "A message to rabbit MQ" should "be sent" in:
    val factory = new ConnectionFactory()
    factory.setHost("localhost")
    factory.setPort(5672)
    val connection: Connection = factory.newConnection()
    val channel: Channel = connection.createChannel()
    val queueName = "testQueue"
    channel.queueDeclare(queueName, false, false, false, null)
    val message = "Hello from Scala 3!"
    channel.basicPublish("", queueName, null, message.getBytes())
    println(s"Sent message to RabbitMQ: '$message'")

