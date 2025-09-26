import com.rabbitmq.client.{ConnectionFactory, Connection, Channel}

object Main extends cask.MainRoutes{
  override def port: Int = 9000 // Use your desired port here

  // --- RabbitMQ connection ---
  val factory = new ConnectionFactory()
  factory.setHost("localhost")
  factory.setPort(5672) // default RabbitMQ port
  val connection: Connection = factory.newConnection()
  val channel: Channel = connection.createChannel()

  val queueName = "testQueue"
  channel.queueDeclare(queueName, false, false, false, null)
  val message = "Hello from Scala 3!"
    
  @cask.get("/")
  def hello(request: cask.Request) = {
    print(request.headers)
    channel.basicPublish("", queueName, null, message.getBytes())
    println(s"Sent message to RabbitMQ: '$message'")
    "Hello World!"
    "ahgsha"
  }

  initialize()
}
