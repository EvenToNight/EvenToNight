package service

import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand
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

  private def validUpdateEventPosterCommand(
      eventId: String,
      posterUrl: String
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(eventId, posterUrl)

  "EventService" should "be instantiated correctly" in:
    service.`should`(be(a[EventService]))

  "handleCommand with CreateEventDraftCommand" should "create event draft successfully with valid command" in:
    val command = validCreateEventDraftCommand()

    val eventId = service.handleCommand(command) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")

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

    val eventId = service.handleCommand(command) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")
    eventId should not be empty

  "handleCommand with GetEventCommand" should "return event when found" in:
    val createCommand = validCreateEventDraftCommand()
    val eventId = service.handleCommand(createCommand) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")

    val getCommand = validGetEventCommand(eventId)
    val retrievedEvent = service.handleCommand(getCommand) match
      case Right(event: Event) => event
      case _                   => fail("Expected Event object")

    retrievedEvent._id shouldBe eventId
    retrievedEvent should not be Event.nil()

  it should "return nil event when not found" in:
    val getCommand = validGetEventCommand("non-existent")
    val retrievedEvent = service.handleCommand(getCommand) match
      case Right(event: Event) => event
      case _                   => fail("Expected Event object")

    retrievedEvent shouldBe Event.nil()

  it should "return nil event for invalid command with empty id" in:
    val invalidGetCommand = validGetEventCommand("")
    val retrievedEvent = service.handleCommand(invalidGetCommand) match
      case Right(event: Event) => event
      case _                   => Event.nil()

    retrievedEvent shouldBe Event.nil()

  "handleCommand with UpdateEventPosterCommand" should "update poster URL successfully" in:
    val createCommand = validCreateEventDraftCommand()
    val eventId = service.handleCommand(createCommand) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")
    val newPosterUrl  = "https://example.com/new-poster.jpg"
    val updateCommand = validUpdateEventPosterCommand(eventId, newPosterUrl)
    val result        = service.handleCommand(updateCommand)
    result shouldBe Right(())

  it should "fail when updating poster for non-existent event" in:
    val updateCommand = validUpdateEventPosterCommand("non-existent-id", "https://example.com/poster.jpg")

    val result = service.handleCommand(updateCommand)
    result.shouldBe(a[Left[String, ?]])
