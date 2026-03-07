package commons.rabbitmq

object RabbitConfig:
  val host: String = sys.env.getOrElse("RABBITMQ_HOST", "localhost")
  val port: Int    = sys.env.getOrElse("RABBITMQ_PORT", "5672").toInt
  val user: String = sys.env.getOrElse("RABBITMQ_USER", "guest")
  val pass: String = sys.env.getOrElse("RABBITMQ_PASS", "guest")
