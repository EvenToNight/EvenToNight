package service

import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand
import domain.models.Event
import domain.models.EventTag
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
      location: String = "Test Location",
      date: LocalDateTime = LocalDateTime.of(2025, 12, 31, 20, 0),
      id_creator: String = "creator-123",
      id_collaborator: Option[String] = None
  ): CreateEventDraftCommand =
    CreateEventDraftCommand(title, description, poster, tag, location, date, id_creator, id_collaborator)

  private def validGetEventCommand(id_event: String): GetEventCommand =
    GetEventCommand(id_event)

  "EventService" should "be instantiated correctly" in:
    service.`should`(be(a[EventService]))

  "handleCommand with CreateEventDraftCommand" should "create event draft successfully with valid command" in:
    val command = validCreateEventDraftCommand()

    val eventId = service.handleCommand(command)
    eventId should not be empty
    eventId should have length 36

  it should "handle multiple event tags correctly" in:
    val multipleTags = List(
      EventTag.TypeOfEvent.Concert,
      EventTag.VenueType.Theatre,
      EventTag.MusicGenre.Jazz,
      EventTag.Theme.Festival,
      EventTag.Target.Students
    )
    val command = validCreateEventDraftCommand(tag = multipleTags)

    val eventId = service.handleCommand(command)
    eventId should not be empty

  it should "handle empty tag list" in:
    val command = validCreateEventDraftCommand(tag = List.empty)

    val eventId = service.handleCommand(command)
    eventId should not be empty

  it should "return validation error message for empty title" in:
    val invalidCommand = validCreateEventDraftCommand(title = "")

    val result = service.handleCommand(invalidCommand)
    result should startWith("Validation failed")
    result should include("Title")

  it should "return validation error for past date" in:
    val pastDate       = LocalDateTime.of(2020, 1, 1, 12, 0)
    val invalidCommand = validCreateEventDraftCommand(date = pastDate)

    val result = service.handleCommand(invalidCommand)
    result should startWith("Validation failed")
    result should include("Date")

  it should "return validation error for empty description" in:
    val invalidCommand = validCreateEventDraftCommand(description = "")

    val result = service.handleCommand(invalidCommand)
    result should startWith("Validation failed")
    result should include("Description")

  it should "return validation error for empty location" in:
    val invalidCommand = validCreateEventDraftCommand(location = "")

    val result = service.handleCommand(invalidCommand)
    result should startWith("Validation failed")
    result should include("Location")

  it should "return validation error for empty creator id" in:
    val invalidCommand = validCreateEventDraftCommand(id_creator = "")

    val result = service.handleCommand(invalidCommand)
    result should startWith("Validation failed")
    result should include("Creator")

  "handleCommand with GetEventCommand" should "return event when found" in:
    val createCommand = validCreateEventDraftCommand()
    val eventId       = service.handleCommand(createCommand)

    val getCommand     = validGetEventCommand(eventId)
    val retrievedEvent = service.handleCommand(getCommand)

    retrievedEvent._id shouldBe eventId
    retrievedEvent should not be Event.nil()

  it should "return nil event when not found" in:
    val getCommand     = validGetEventCommand("non-existent")
    val retrievedEvent = service.handleCommand(getCommand)

    retrievedEvent shouldBe Event.nil()

  it should "return nil event for invalid command with empty id" in:
    val invalidGetCommand = validGetEventCommand("")
    val retrievedEvent    = service.handleCommand(invalidGetCommand)

    retrievedEvent shouldBe Event.nil()
