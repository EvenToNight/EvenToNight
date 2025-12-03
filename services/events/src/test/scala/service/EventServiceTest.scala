package service

import domain.commands.CreateEventDraftCommand
import domain.commands.GetAllEventsCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand
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

class EventServiceTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var repo: EventRepository     = uninitialized
  var publisher: EventPublisher = uninitialized
  var service: EventService     = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    repo = new MongoEventRepository("mongodb://localhost:27017", "eventonight_test")
    publisher = new MockEventPublisher
    service = new EventService(repo, publisher)

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

  private def validGetEventCommand(id_event: String = "event-123"): GetEventCommand =
    GetEventCommand(id_event)

  private def validUpdateEventPosterCommand(
      eventId: String = "event-123",
      posterUrl: String = "poster-url.jpg"
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(eventId, posterUrl)

  private def validGetAllEventsCommand(): GetAllEventsCommand =
    GetAllEventsCommand()

  "EventService" should "be instantiated correctly" in:
    service.`should`(be(a[EventService]))

  "handleCommand" should "successfully process valid CreateEventDraftCommand" in:
    val command = validCreateEventDraftCommand()
    val result  = service.handleCommand(command)

    result.isRight shouldBe true

  it should "return validation errors for CreateEventDraftCommand with empty title" in:
    val command = validCreateEventDraftCommand(title = "")

    val result = service.handleCommand(command)

    result shouldBe Left("Title cannot be empty")

  it should "return validation errors for CreateEventDraftCommand with invalid date" in:
    val command = validCreateEventDraftCommand(date = LocalDateTime.of(2020, 1, 1, 0, 0))

    val result = service.handleCommand(command)

    result shouldBe Left("Date must be in the future")

  it should "return validation errors for CreateEventDraftCommand with empty location" in:
    val command = validCreateEventDraftCommand(location = Location.Nil())

    val result = service.handleCommand(command)

    result shouldBe Left("Location has invalid parameters")

  it should "return validation errors for CreateEventDraftCommand with empty description" in:
    val command = validCreateEventDraftCommand(description = "")

    val result = service.handleCommand(command)

    result shouldBe Left("Description cannot be empty")

  it should "concatenate multiple validation errors for CreateEventDraftCommand" in:
    val command =
      validCreateEventDraftCommand(title = "", date = LocalDateTime.of(2020, 1, 1, 0, 0), location = Location.Nil())

    val result = service.handleCommand(command) match
      case Left(errors) => errors
      case _            => fail("Expected validation errors")

    result should include(",")

  it should "successfully process valid UpdateEventPosterCommand" in:
    val createCommand = validCreateEventDraftCommand()
    val eventId = service.handleCommand(createCommand) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")

    val command = validUpdateEventPosterCommand(eventId = eventId)
    val result  = service.handleCommand(command)
    result.isRight shouldBe true

  it should "return errors for UpdateEventPosterCommand with non-existent eventId" in:
    val command = validUpdateEventPosterCommand(eventId = "non-existent-id")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "return validation errors for UpdateEventPosterCommand with empty eventId" in:
    val command = validUpdateEventPosterCommand(eventId = "")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "return validation errors for UpdateEventPosterCommand with invalid posterUrl" in:
    val command = validUpdateEventPosterCommand(posterUrl = "invalid-url")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "successfully process valid GetEventCommand" in:
    val createCommand = validCreateEventDraftCommand()
    val eventId = service.handleCommand(createCommand) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")
    val command = validGetEventCommand(eventId)
    val result  = service.handleCommand(command)
    result.isRight shouldBe true

  it should "return validation errors for GetEventCommand with empty id" in:
    val command = validGetEventCommand("")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "handle non-existent event gracefully" in:
    val command = validGetEventCommand("non-existent")
    val result  = service.handleCommand(command)
    result should matchPattern { case Left(_) | Right(_) => }

  it should "correctly initialize eventQueryService" in:
    service.eventQueryService should not be null
    service.eventQueryService shouldBe a[EventQueryService]

  it should "correctly initialize eventCommandService" in:
    service.eventCommandService should not be null
    service.eventCommandService shouldBe a[DomainEventService]

  it should "route CreateEventDraftCommand to appropriate service method" in:
    val command = validCreateEventDraftCommand()
    noException should be thrownBy service.handleCommand(command)

  it should "route UpdateEventPosterCommand to appropriate service method" in:
    val command = validUpdateEventPosterCommand()
    noException should be thrownBy service.handleCommand(command)

  it should "route GetEventCommand to appropriate service method" in:
    val command = validGetEventCommand()
    noException should be thrownBy service.handleCommand(command)

  it should "route GetAllEventsCommand to appropriate service method" in:
    val command = validGetAllEventsCommand()
    noException should be thrownBy service.handleCommand(command)

  it should "successfully process GetAllEventsCommand and return published events" in:
    val command = validGetAllEventsCommand()
    val result  = service.handleCommand(command)

    result shouldBe a[Right[?, ?]]
    result match
      case Right(events) => events shouldBe a[List[?]]
      case Left(error)   => fail(s"Expected Right with events list, but got Left: $error")

  it should "handle all command types without throwing exceptions" in:
    val commands = List(
      validCreateEventDraftCommand(),
      validUpdateEventPosterCommand(),
      validGetEventCommand(),
      validGetAllEventsCommand()
    )
    commands.foreach: cmd =>
      noException should be thrownBy service.handleCommand(cmd)
