import com.rabbitmq.client.Channel
import com.rabbitmq.client.Connection
import com.rabbitmq.client.ConnectionFactory

object Main extends cask.MainRoutes {
  override def port: Int = 9000 // Use your desired port here
  override def host: String = "0.0.0.0"

  // --- RabbitMQ connection ---
  val factory = new ConnectionFactory()
  Option(System.getenv("RABBITMQ_HOST")) match
    case Some(host) => factory.setHost(host)
    case None       => factory.setHost("localhost") // RabbitMQ service hostname
  factory.setPort(5672) // default RabbitMQ port
  val connection: Connection = factory.newConnection()
  val channel: Channel       = connection.createChannel()

  val queueName = "testQueue"
  channel.queueDeclare(queueName, false, false, false, null)
  val message = "Hello from Scala 3!"

  @cask.get("/")
  def hello(request: cask.Request) = {
    print(request.headers)
    channel.basicPublish("", queueName, null, message.getBytes())
    println(s"Sent message to RabbitMQ: '$message'")
    "Hello World!"
  }

  sys.addShutdownHook {
    try {
      channel.close()
    } catch {
      case e: Exception => println(s"Error closing channel: ${e.getMessage}")
    }
    try {
      connection.close()
    } catch {
      case e: Exception => println(s"Error closing connection: ${e.getMessage}")
    }
  }

  initialize()
}
