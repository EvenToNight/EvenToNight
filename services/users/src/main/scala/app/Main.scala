package app

import controller.UserRoutes
import infrastructure.MongoConnection.client
import infrastructure.RabbitConnection._
import infrastructure.Wiring._

object Main extends cask.MainRoutes {
  override def port: Int                   = 9000 // Use your desired port here
  override def host: String                = "0.0.0.0"
  override def allRoutes: Seq[cask.Routes] = Seq(new UserRoutes(userService))

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
