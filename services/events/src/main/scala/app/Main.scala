package app

import controller.EventController
import infrastructure.db.MongoEventRepository
import infrastructure.messaging.MockEventPublisher
import service.EventService

object Main extends App {

  val mongoHost = Option(System.getenv("MONGO_HOST")).getOrElse("localhost")
  val mongoPort = "27017"
  val mongoUri  = s"mongodb://$mongoHost:$mongoPort"

  val database      = MongoEventRepository(mongoUri, "eventonight")
  val messageBroker = new MockEventPublisher()

  val eventService = new EventService(database, messageBroker)

  val controller = new EventController(eventService)

  controller.main(Array())

}
