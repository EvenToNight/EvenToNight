package service

import domain.commands.CreateEventCommand
import domain.models.Event
import domain.models.EventStatus
import domain.models.EventTag
import domain.models.Location
import infrastructure.db.EventRepository
import infrastructure.db.MongoEventRepository
import infrastructure.messaging.EventPublisher
import infrastructure.messaging.MockEventPublisher
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
      tag: List[EventTag] = List(EventTag.VenueType.Bar),
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
      id_collaborator: Option[String] = None
  ): CreateEventCommand =
    CreateEventCommand(title, description, poster, tag, location, date, price, status, id_creator, id_collaborator)

  "DomainEventService" should "be instantiated correctly" in:
    service shouldBe a[DomainEventService]

  "createEventDraft" should "create an event draft successfully" in:
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
