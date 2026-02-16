package infrastructure.configuration

import application.EventApplicationService
import com.mongodb.client.MongoClient
import domain.repositories.{DomainEventPublisher, EventRepository, OrganizationRepository, UnitOfWork}
import infrastructure.adapters.*
import infrastructure.db.{MongoEventRepository, MongoUserMetadataRepository, PriceRepository}
import infrastructure.messaging.EventPublisher

/** Factory for creating the complete application with all dependencies wired
  * This follows Dependency Injection and Composition Root patterns
  *
  * Responsibilities:
  * - Create infrastructure adapters
  * - Wire domain ports to infrastructure implementations
  * - Build the application service with all dependencies
  */
object DependencyFactory:

  /** Creates EventApplicationService with all dependencies properly wired
    *
    * @param mongoClient MongoDB client for database operations
    * @param connectionString MongoDB connection string
    * @param databaseName MongoDB database name
    * @param eventPublisher Infrastructure event publisher (RabbitMQ or Mock)
    * @param priceRepository Optional price repository
    * @return Fully configured EventApplicationService
    */
  def createEventApplicationService(
      mongoClient: MongoClient,
      connectionString: String,
      databaseName: String,
      eventPublisher: EventPublisher,
      priceRepository: Option[PriceRepository] = None
  ): EventApplicationService =

    // Infrastructure repositories (existing code)
    val infraEventRepository = MongoEventRepository(
      connectionString = connectionString,
      databaseName = databaseName,
      collectionName = "events",
      messageBroker = eventPublisher,
      priceRepository = priceRepository
    )

    val infraUserMetadataRepository = MongoUserMetadataRepository(
      connectionString = connectionString,
      databaseName = databaseName,
      collectionName = "users",
      messageBroker = eventPublisher,
      sharedMongoClient = Some(mongoClient)
    )

    // Create adapters (implementing domain ports)
    val eventRepository: EventRepository =
      MongoEventRepositoryAdapter(infraEventRepository)

    val organizationRepository: OrganizationRepository =
      MongoOrganizationRepositoryAdapter(infraUserMetadataRepository)

    val domainEventPublisher: DomainEventPublisher =
      DomainEventPublisherAdapter(eventPublisher)

    val unitOfWork: UnitOfWork =
      MongoUnitOfWork(mongoClient)

    // Create and return application service
    EventApplicationService(
      eventRepository = eventRepository,
      organizationRepository = organizationRepository,
      eventPublisher = domainEventPublisher,
      unitOfWork = unitOfWork
    )

  /** Creates EventServiceAdapter that wraps EventApplicationService
    * This adapter converts between domain aggregates and DTOs for controllers
    */
  def createEventService(
      mongoClient: MongoClient,
      connectionString: String,
      databaseName: String,
      eventPublisher: EventPublisher,
      priceRepository: Option[PriceRepository] = None
  ): EventServiceAdapter =
    val applicationService = createEventApplicationService(
      mongoClient,
      connectionString,
      databaseName,
      eventPublisher,
      priceRepository
    )

    EventServiceAdapter(applicationService)

  /** Creates a simplified version for testing with mock implementations
    * Useful for unit tests and development
    */
  def createMockEventApplicationService(
      mongoClient: MongoClient,
      connectionString: String,
      databaseName: String
  ): EventApplicationService =
    import infrastructure.messaging.MockEventPublisher

    createEventApplicationService(
      mongoClient = mongoClient,
      connectionString = connectionString,
      databaseName = databaseName,
      eventPublisher = MockEventPublisher(),
      priceRepository = None
    )
