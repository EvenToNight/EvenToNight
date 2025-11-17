package app

import controller.EventRoutes
import infrastructure.db.MongoEventRepository
import infrastructure.messaging.MockEventPublisher
import service.EventService

object Main extends App {

  val mongoHost = sys.env.getOrElse("MONGO_HOST", "localhost")
  val mongoPort = "27017"
  val mongoUri  = s"mongodb://$mongoHost:$mongoPort"

  val database      = MongoEventRepository(mongoUri, "eventonight")
  val messageBroker = new MockEventPublisher()

  val eventService = new EventService(database, messageBroker)

  val routes = new EventRoutes(eventService)
  routes.main(Array())
}
