package service

import domain.commands.{CreateEventCommand, DeleteEventCommand, UpdateEventCommand}
import domain.models.{Event, EventStatus, EventTag, Location}
import infrastructure.db.{EventRepository, MongoEventRepository}
import infrastructure.messaging.{EventPublisher, MockEventPublisher}
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import scala.compiletime.uninitialized

class FailingEventRepository extends EventRepository:
  override def save(event: Event): Either[Throwable, Unit]   = Left(new RuntimeException("Database connection failed"))
  override def findById(id_event: String): Option[Event]     = None
  override def update(event: Event): Either[Throwable, Unit] = Left(new RuntimeException("Database connection failed"))
  override def findAllPublished(): Either[Throwable, List[Event]] =
    Left(new RuntimeException("Database connection failed"))
  override def delete(id_event: String): Either[Throwable, Unit] =
    Left(new RuntimeException("Database connection failed"))

  override def findByFilters(
      limit: Option[Int],
      offset: Option[Int],
      status: Option[EventStatus],
      title: Option[String],
      tags: Option[List[String]],
      startDate: Option[String],
      endDate: Option[String],
      id_organization: Option[String],
      city: Option[String],
      location_name: Option[String]
  ): Either[Throwable, (List[Event], Boolean)] =
    Left(new RuntimeException("Database connection failed"))

class DomainEventServiceTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  var repo: EventRepository       = uninitialized
  var publisher: EventPublisher   = uninitialized
  var service: DomainEventService = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    repo = new MongoEventRepository("mongodb://localhost:27017", "eventonight_test")
    publisher = new MockEventPublisher()
    service = new DomainEventService(repo, publisher)

  private def validCreateEventCommand(
      title: String = "Test Event",
      description: String = "Test Description",
      poster: String = "test-poster.jpg",
      tags: List[EventTag] = List(EventTag.VenueType.Bar),
      location: Location = Location.create(
        country = "Test Country",
        country_code = "TC",
        road = "Test Road",
        postcode = "12345",
        house_number = "10A",
        lat = 45.0,
        lon = 90.0,
        link = "http://example.com/location"
      ),
      price: Double = 15.0,
      date: LocalDateTime = LocalDateTime.of(2025, 12, 31, 20, 0),
      status: EventStatus = EventStatus.DRAFT,
      id_creator: String = "creator-123",
      id_collaborators: Option[List[String]] = None
  ): CreateEventCommand =
    CreateEventCommand(title, description, poster, tags, location, date, price, status, id_creator, id_collaborators)

  private def validUpdateEventCommand(
      id_event: String,
      title: Option[String],
      description: Option[String] = None,
      tags: Option[List[EventTag]] = None,
      location: Option[Location] = None,
      date: Option[LocalDateTime] = None,
      price: Option[Double] = None,
      status: Option[EventStatus] = None,
      id_collaborators: Option[List[String]] = None
  ): UpdateEventCommand =
    UpdateEventCommand(
      id_event,
      title,
      description,
      tags,
      location,
      date,
      price,
      status,
      id_collaborators
    )

  "DomainEventService" should "be instantiated correctly" in:
    service shouldBe a[DomainEventService]

  "execCommand" should "create an event draft successfully" in:
    val cmd    = validCreateEventCommand()
    val result = service.execCommand(cmd)
    result.isRight shouldBe true

  it should "fail when database save operation fails" in:
    val failingRepo    = new FailingEventRepository()
    val failingService = new DomainEventService(failingRepo, publisher)

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
    val id_event = createResult.fold(
      _ => fail("Failed to create event"),
      identity
    )
    val updateCmd = validUpdateEventCommand(
      id_event = id_event,
      title = Some("Updated Event Title"),
      price = Some(25.0)
    )
    val updateResult = service.execCommand(updateCmd)
    updateResult.isRight shouldBe true

  it should "fail when updating a non-existent event" in:
    val updateCmd = validUpdateEventCommand(
      id_event = "non-existent-event-id",
      title = Some("Updated Event Title")
    )
    val updateResult = service.execCommand(updateCmd)
    updateResult.isLeft shouldBe true
    updateResult match
      case Left(error) => error shouldBe "Event with id non-existent-event-id not found"
      case Right(_)    => fail("Expected failure when updating non-existent event")

  it should "fail when database update operation fails" in:
    val failingRepo    = new FailingEventRepository()
    val failingService = new DomainEventService(failingRepo, publisher)
    val updateCmd = validUpdateEventCommand(
      id_event = "some-event-id",
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
    val id_event = createResult.fold(
      _ => fail("Failed to create event"),
      identity
    )
    val deleteCmd    = DeleteEventCommand(id_event)
    val deleteResult = service.execCommand(deleteCmd)
    deleteResult.isRight shouldBe true

  it should "change status when deleting a published event" in:
    val createCmd    = validCreateEventCommand(status = EventStatus.PUBLISHED)
    val createResult = service.execCommand(createCmd)
    createResult.isRight shouldBe true
    val id_event = createResult.fold(
      _ => fail("Failed to create event"),
      identity
    )
    val deleteCmd    = DeleteEventCommand(id_event)
    val deleteResult = service.execCommand(deleteCmd)
    deleteResult.isRight shouldBe true
    val fetchedEvent = repo.findById(id_event)
    fetchedEvent match
      case Some(event) => event.status shouldBe EventStatus.CANCELLED
      case None        => fail("Event should exist after deletion")

  it should "delete draft or cancelled events from the database" in:
    val createCmd    = validCreateEventCommand(status = EventStatus.DRAFT)
    val createResult = service.execCommand(createCmd)
    createResult.isRight shouldBe true
    val id_event = createResult.fold(
      _ => fail("Failed to create event"),
      identity
    )
    val deleteCmd    = DeleteEventCommand(id_event)
    val deleteResult = service.execCommand(deleteCmd)
    deleteResult.isRight shouldBe true
    val fetchedEvent = repo.findById(id_event)
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
    val failingService = new DomainEventService(failingRepo, publisher)
    val deleteCmd      = DeleteEventCommand("some-event-id")
    val deleteResult   = failingService.execCommand(deleteCmd)
    deleteResult.isLeft shouldBe true
    deleteResult match
      case Left(error) => error shouldBe "Event with id some-event-id not found"
      case Right(_)    => fail("Expected failure when database delete fails")
