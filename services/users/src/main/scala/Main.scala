import commons.middleware.cors.CorsHandler
import commons.rabbitmq.RabbitClient
import commons.rabbitmq.RabbitConfig
import infrastructure.Wiring._
import infrastructure.messaging.EventPublisher
import infrastructure.persistence.mongo.MongoConnection.client
import io.undertow.server.HttpHandler
import presentation.http.routes.AuthRoutes
import presentation.http.routes.UserRoutes
import presentation.http.routes._

object Main extends cask.MainRoutes {
  override def port: Int                   = sys.env.getOrElse("PORT", "9000").toInt
  override def host: String                = "0.0.0.0"
  override def defaultHandler: HttpHandler = new CorsHandler(super.defaultHandler)

  private val rabbitClient: RabbitClient = new RabbitClient(
    RabbitConfig.host,
    RabbitConfig.port,
    RabbitConfig.user,
    RabbitConfig.pass
  )
  private val exchangeName: String = "eventonight"
  rabbitClient.declareTopicExchange(exchangeName)
  private val eventPublisher =
    EventPublisher(rabbitClient, exchangeName) // Use EventPublisher.mock() to use the mock publisher

  override def allRoutes: Seq[cask.Routes] =

    Seq(
      new AuthRoutes(authService, userService, eventPublisher),
      new UserRoutes(authService, userService, userQueryService, mediaService, eventPublisher),
      new AppRoutes()
    )

  sys.addShutdownHook {
    try {
      rabbitClient.close()
    } catch {
      case e: Exception => println(s"Error closing RabbitMQ connection: ${e.getMessage}")
    }
    try {
      client.close()
    } catch {
      case e: Exception => println(s"Error closing Mongo client: ${e.getMessage}")
    }
  }

  initialize()
}
