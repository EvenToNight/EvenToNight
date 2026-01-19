package app

import controller._
import infrastructure.Wiring._
import infrastructure.mongo.MongoConnection.client
import infrastructure.rabbitmq.RabbitConnection._
import io.undertow.server.HttpHandler
import middleware.CorsHandler

object Main extends cask.MainRoutes {
  override def port: Int                   = sys.env.getOrElse("PORT", "9000").toInt
  override def host: String                = "0.0.0.0"
  override def defaultHandler: HttpHandler = new CorsHandler(super.defaultHandler)
  override def allRoutes: Seq[cask.Routes] =
    Seq(new AuthRoutes(authService, userService), new UserRoutes(userService), new AppRoutes())

  sys.addShutdownHook {
    try {
      channel.close()
    } catch {
      case e: Exception => println(s"Error closing RabbitMQ channel: ${e.getMessage}")
    }
    try {
      connection.close()
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
