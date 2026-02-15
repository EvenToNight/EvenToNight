package app

import controller.Controller
import infrastructure.db.{MongoEventRepository, MongoPriceRepository, MongoUserMetadataRepository, TransactionManager}
import infrastructure.messaging.{ExternalEventHandler, RabbitEventConsumer, RabbitEventPublisher}
import middleware.auth.JwtService
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

  val priceDatabase: MongoPriceRepository = new MongoPriceRepository(
    mongoUri,
    "eventonight",
    "prices",
    messageBroker
  )

  val eventDatabase: MongoEventRepository = MongoEventRepository(
    mongoUri,
    "eventonight",
    "events",
    messageBroker,
    Some(priceDatabase)
  )

  val userDatabase: MongoUserMetadataRepository = new MongoUserMetadataRepository(
    mongoUri,
    "eventonight",
    "users",
    messageBroker,
    sharedMongoClient = Some(eventDatabase.mongoClient)
  )

  val transactionManager: TransactionManager = new TransactionManager(eventDatabase.mongoClient)

  val eventService: EventService = new EventService(eventDatabase, userDatabase, messageBroker, transactionManager)

  val externalEventHandler: ExternalEventHandler = new ExternalEventHandler(userDatabase, priceDatabase, eventDatabase)
  val messageConsumer: RabbitEventConsumer = new RabbitEventConsumer(
    host = rabbitHost,
    port = rabbitPort,
    username = rabbitUser,
    password = rabbitPass,
    exchangeName = "eventonight",
    queueName = "events-service-queue",
    routingKeys =
      List("user.created", "user.deleted", "ticket-type.created", "ticket-type.updated", "ticket-type.deleted"),
    handler = externalEventHandler
  )
  messageConsumer.start()

  JwtService.initialize()

  val routes: Controller = new Controller(eventService)
  routes.main(Array())
