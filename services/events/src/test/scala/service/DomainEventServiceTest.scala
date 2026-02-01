package service

import domain.commands.{CreateEventCommand, DeleteEventCommand, UpdateEventCommand}
import domain.models.{Event, EventStatus, EventTag, Location, UserMetadata}
import infrastructure.db.{EventRepository, MongoEventRepository, MongoUserMetadataRepository}
import infrastructure.messaging.{EventPublisher, MockEventPublisher}
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import scala.compiletime.uninitialized

class FailingEventRepository extends EventRepository:
  override def save(event: Event): Either[Throwable, Unit]   = Left(new RuntimeException("Database connection failed"))
  override def findById(eventId: String): Option[Event]      = None
  override def update(event: Event): Either[Throwable, Unit] = Left(new RuntimeException("Database connection failed"))
  override def findAllPublished(): Either[Throwable, List[Event]] =
    Left(new RuntimeException("Database connection failed"))
  override def delete(eventId: String): Either[Throwable, Unit] =
    Left(new RuntimeException("Database connection failed"))

  override def findByFilters(
      limit: Option[Int],
      offset: Option[Int],
      status: Option[List[EventStatus]],
      title: Option[String],
      tags: Option[List[String]],
      startDate: Option[String],
      endDate: Option[String],
      organizationId: Option[String],
      city: Option[String],
      location_name: Option[String],
      sortBy: Option[String],
      sortOrder: Option[String],
      query: Option[String]
  ): Either[Throwable, (List[Event], Boolean)] =
    Left(new RuntimeException("Database connection failed"))

class DomainEventServiceTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  var repo: EventRepository                 = uninitialized
  var userRepo: MongoUserMetadataRepository = uninitialized
  var publisher: EventPublisher             = uninitialized
  var service: DomainEventService           = uninitialized
  var creatorId: String                     = "creator-123"

  override def beforeEach(): Unit =
    super.beforeEach()
    repo = new MongoEventRepository(
      "mongodb://localhost:27017",
      "eventonight_test",
      messageBroker = new MockEventPublisher()
    )
    userRepo = new MongoUserMetadataRepository(
      "mongodb://localhost:27017",
      "eventonight_test",
      messageBroker = new MockEventPublisher()
    )
    userRepo.save(UserMetadata(
      id = creatorId,
      role = "organization",
      name = "Test Organization"
    ))

    publisher = new MockEventPublisher()
    service = new DomainEventService(repo, userRepo, publisher, "mock")

  private def validCreateEventCommand(
      title: Option[String] = Some("Test Event"),
      description: Option[String] = Some("Test Description"),
      poster: Option[String] = Some("test-poster.jpg"),
      tags: Option[List[EventTag]] = Some(List(EventTag.Venue.Bar)),
      location: Option[Location] = Some(Location.create(
        country = Some("Test Country"),
        country_code = Some("TC"),
        road = Some("Test Road"),
        postcode = Some("12345"),
        house_number = Some("10A"),
        lat = Some(45.0),
        lon = Some(90.0),
        link = Some("http://example.com/location")
      )),
      date: Option[LocalDateTime] = Some(LocalDateTime.now().plusDays(10)),
      status: EventStatus = EventStatus.DRAFT,
      creatorId: String = creatorId,
      collaboratorIds: Option[List[String]] = None
  ): CreateEventCommand =
    CreateEventCommand(title, description, poster, tags, location, date, status, creatorId, collaboratorIds)

  private def validUpdateEventCommand(
      eventId: String,
      title: Option[String],
      description: Option[String] = None,
      tags: Option[List[EventTag]] = None,
      location: Option[Location] = None,
      date: Option[LocalDateTime] = None,
      status: EventStatus = EventStatus.DRAFT,
      collaboratorIds: Option[List[String]] = None
  ): UpdateEventCommand =
    UpdateEventCommand(
      eventId,
      title,
      description,
      tags,
      location,
      date,
      status,
      collaboratorIds
    )

  "DomainEventService" should "be instantiated correctly" in:
    service shouldBe a[DomainEventService]

  "execCommand" should "create an event draft successfully" in:
    val cmd    = validCreateEventCommand()
    val result = service.execCommand(cmd)
    result.isRight shouldBe true

  it should "fail when database save operation fails" in:
    val failingRepo    = new FailingEventRepository()
    val failingService = new DomainEventService(failingRepo, userRepo, publisher, "mock")

    val cmd    = validCreateEventCommand()
    val result = failingService.execCommand(cmd)

    result.isLeft shouldBe true
    result match
      case Left(error) => error shouldBe "Failed to save new event"
      case Right(_)    => fail("Expected failure when database save fails")

  "execCommand" should "update an existing event successfully" in:
    val createCmd    = validCreateEventCommand()
    val createResult = service.execCommand(createCmd)
    createResult.isRight shouldBe true
    val eventId = createResult.fold(
      _ => fail("Failed to create event"),
      identity
    )
    val updateCmd = validUpdateEventCommand(
      eventId = eventId,
      title = Some("Updated Event Title")
    )
    val updateResult = service.execCommand(updateCmd)
    updateResult.isRight shouldBe true

  it should "fail when updating a non-existent event" in:
    val updateCmd = validUpdateEventCommand(
      eventId = "non-existent-event-id",
      title = Some("Updated Event Title")
    )
    val updateResult = service.execCommand(updateCmd)
    updateResult.isLeft shouldBe true
    updateResult match
      case Left(error) => error shouldBe "Event with id non-existent-event-id not found"
      case Right(_)    => fail("Expected failure when updating non-existent event")

  it should "fail when database update operation fails" in:
    val failingRepo    = new FailingEventRepository()
    val failingService = new DomainEventService(failingRepo, userRepo, publisher, "mock")
    val updateCmd = validUpdateEventCommand(
      eventId = "some-event-id",
      title = Some("Updated Event Title")
    )
    val updateResult = failingService.execCommand(updateCmd)
    updateResult.isLeft shouldBe true
    updateResult match
      case Left(error) => error shouldBe "Event with id some-event-id not found"
      case Right(_)    => fail("Expected failure when database update fails")

  "execCommand" should "delete an existing event successfully" in:
    val createCmd    = validCreateEventCommand()
    val createResult = service.execCommand(createCmd)
    createResult.isRight shouldBe true
    val eventId = createResult.fold(
      _ => fail("Failed to create event"),
      identity
    )
    val deleteCmd    = DeleteEventCommand(eventId)
    val deleteResult = service.execCommand(deleteCmd)
    deleteResult.isRight shouldBe true

  it should "change status when deleting a published event" in:
    val createCmd    = validCreateEventCommand(status = EventStatus.PUBLISHED)
    val createResult = service.execCommand(createCmd)
    createResult.isRight shouldBe true
    val eventId = createResult.fold(
      _ => fail("Failed to create event"),
      identity
    )
    val deleteCmd    = DeleteEventCommand(eventId)
    val deleteResult = service.execCommand(deleteCmd)
    deleteResult.isRight shouldBe true
    val fetchedEvent = repo.findById(eventId)
    fetchedEvent match
      case Some(event) => event.status shouldBe EventStatus.CANCELLED
      case None        => fail("Event should exist after deletion")

  it should "delete draft or cancelled events from the database" in:
    val createCmd    = validCreateEventCommand(status = EventStatus.DRAFT)
    val createResult = service.execCommand(createCmd)
    createResult.isRight shouldBe true
    val eventId = createResult.fold(
      _ => fail("Failed to create event"),
      identity
    )
    val deleteCmd    = DeleteEventCommand(eventId)
    val deleteResult = service.execCommand(deleteCmd)
    deleteResult.isRight shouldBe true
    val fetchedEvent = repo.findById(eventId)
    fetchedEvent match
      case Some(_) => fail("Event should be deleted from the database")
      case None    => succeed

  it should "fail when deleting a non-existent event" in:
    val deleteCmd    = DeleteEventCommand("non-existent-event-id")
    val deleteResult = service.execCommand(deleteCmd)
    deleteResult.isLeft shouldBe true
    deleteResult match
      case Left(error) => error shouldBe "Event with id non-existent-event-id not found"
      case Right(_)    => fail("Expected failure when deleting non-existent event")

  it should "fail when database delete operation fails" in:
    val failingRepo    = new FailingEventRepository()
    val failingService = new DomainEventService(failingRepo, userRepo, publisher, "mock")
    val deleteCmd      = DeleteEventCommand("some-event-id")
    val deleteResult   = failingService.execCommand(deleteCmd)
    deleteResult.isLeft shouldBe true
    deleteResult match
      case Left(error) => error shouldBe "Event with id some-event-id not found"
      case Right(_)    => fail("Expected failure when database delete fails")
