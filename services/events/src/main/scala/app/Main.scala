package app

import controller.Controller
import infrastructure.db.MongoEventRepository
import infrastructure.messaging.MockEventPublisher
import service.EventService

object Main extends App:

  val mongoHost: String = sys.env.getOrElse("MONGO_HOST", "localhost")
  val mongoPort: String = "27017"
  val mongoUri: String  = s"mongodb://$mongoHost:$mongoPort"

  val database: MongoEventRepository    = MongoEventRepository(mongoUri, "eventonight")
  val messageBroker: MockEventPublisher = new MockEventPublisher()

  val eventService: EventService = new EventService(database, messageBroker)

  val routes: Controller = new Controller(eventService)
  routes.main(Array())
