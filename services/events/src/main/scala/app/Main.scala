package app

import controller.Controller
import infrastructure.db.{MongoEventRepository, MongoUserMetadataRepository}
import infrastructure.messaging.{ExternalEventHandler, RabbitEventConsumer, RabbitEventPublisher}
import service.EventService

object Main extends App:

  val mongoHost: String = sys.env.getOrElse("MONGO_HOST", "localhost")
  val mongoPort: String = "27017"
  val mongoUri: String  = s"mongodb://$mongoHost:$mongoPort"

  val rabbitHost: String = sys.env.getOrElse("RABBITMQ_HOST", "localhost")
  val rabbitPort: Int    = sys.env.getOrElse("RABBITMQ_PORT", "5672").toInt
  val rabbitUser: String = sys.env.getOrElse("RABBITMQ_USER", "guest")
  val rabbitPass: String = sys.env.getOrElse("RABBITMQ_PASS", "guest")

  val messageBroker: RabbitEventPublisher = new RabbitEventPublisher(
    host = rabbitHost,
    port = rabbitPort,
    username = rabbitUser,
    password = rabbitPass,
    exchangeName = "eventonight"
  )

  val eventDatabase: MongoEventRepository = MongoEventRepository(mongoUri, "eventonight", "events", messageBroker)

  val userDatabase: MongoUserMetadataRepository = new MongoUserMetadataRepository(
    mongoUri,
    "eventonight",
    "user_metadata",
    messageBroker
  )

  val eventService: EventService = new EventService(eventDatabase, messageBroker)

  val externalEventHandler: ExternalEventHandler = new ExternalEventHandler(userDatabase)
  val messageConsumer: RabbitEventConsumer = new RabbitEventConsumer(
    host = rabbitHost,
    port = rabbitPort,
    username = rabbitUser,
    password = rabbitPass,
    exchangeName = "eventonight",
    queueName = "events-service-queue",
    routingKeys = List("user.created"),
    handler = externalEventHandler
  )
  messageConsumer.start()

  val routes: Controller = new Controller(eventService)
  routes.main(Array())
