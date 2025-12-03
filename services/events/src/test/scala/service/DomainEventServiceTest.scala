package service

import domain.commands.CreateEventDraftCommand
import domain.commands.UpdateEventPosterCommand
import domain.models.Event
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

  private def validCreateEventDraftCommand(
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
      id_creator: String = "creator-123",
      id_collaborator: Option[String] = None
  ): CreateEventDraftCommand =
    CreateEventDraftCommand(title, description, poster, tag, location, date, price, id_creator, id_collaborator)

  private def validUpdateEventPosterCommand(
      eventId: String,
      posterUrl: String
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(eventId, posterUrl)

  "DomainEventService" should "be instantiated correctly" in:
    service shouldBe a[DomainEventService]

  "createEventDraft" should "create an event draft successfully" in:
    val cmd    = validCreateEventDraftCommand()
    val result = service.execCommand(cmd)
    result.isRight shouldBe true

  it should "fail when database save operation fails" in:
    val failingRepo    = new FailingEventRepository()
    val failingService = new DomainEventService(failingRepo, publisher)

    val cmd    = validCreateEventDraftCommand()
    val result = failingService.execCommand(cmd)

    result.isLeft shouldBe true
    result match
      case Left(error) => error shouldBe "Failed to save new event"
      case Right(_)    => fail("Expected failure when database save fails")

  "updateEventPoster" should "update event poster successfully for existing event" in:
    val createCmd    = validCreateEventDraftCommand()
    val createResult = service.execCommand(createCmd)
    createResult.isRight shouldBe true
    val eventId = createResult match
      case Right(id) => id
      case Left(_)   => fail("Failed to create event draft for update test")
    val updateCmd    = validUpdateEventPosterCommand(eventId = eventId, posterUrl = "new-poster.jpg")
    val updateResult = service.execCommand(updateCmd)
    updateResult.isRight shouldBe true

  it should "fail to update event poster for non-existing event" in:
    val updateCmd    = validUpdateEventPosterCommand(eventId = "nonexistent-id", posterUrl = "new-poster.jpg")
    val updateResult = service.execCommand(updateCmd)
    updateResult.isLeft shouldBe true
    updateResult match
      case Left(error) => error shouldBe "Event nonexistent-id not found"
      case Right(_)    => fail("Update should have failed for non-existing event")
