import Wiring._
import connection.MongoConnection.client
import connection.RabbitConnection._
import route.UserRoutes

object Main extends cask.MainRoutes {
  override def port: Int                   = 9000 // Use your desired port here
  override def host: String                = "0.0.0.0"
  override def allRoutes: Seq[cask.Routes] = Seq(new UserRoutes(userService))

  sys.addShutdownHook {
    try {
      channel.close()
      client.close()
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
