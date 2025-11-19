package service

import domain.commands.CreateEventDraftCommand
import domain.models.EventTag
import infrastructure.db.EventRepository
import infrastructure.db.MockEventRepository
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
    repo = new MockEventRepository
    publisher = new MockEventPublisher
    service = new EventService(repo, publisher)

  private def correctCreateEventDraftCommand(
      title: String = "test",
      description: String = "test",
      poster: String = "test",
      tag: List[EventTag] = List(EventTag.VenueType.Bar),
      location: String = "test",
      date: LocalDateTime = LocalDateTime.of(2025, 12, 31, 20, 0),
      id_creator: String = "test",
      id_collaborator: Option[String] = None
  ): CreateEventDraftCommand =
    CreateEventDraftCommand(title, description, poster, tag, location, date, id_creator, id_collaborator)

  "EventService" should "be instantiated correctly" in:
    service shouldBe a[EventService]

  "HandleCreateDraft" should "handle valid command with all required fields" in:
    val command = correctCreateEventDraftCommand()

    val eventId = service.handleCreateDraft(command)
    eventId should not be empty
    eventId should have length 36

  it should "handle command without collaborator" in:
    val command = correctCreateEventDraftCommand(
      id_collaborator = None
    )

    val eventId = service.handleCreateDraft(command)
    eventId should not be empty

  it should "handle command with multiple tags" in:
    val multipleTags = List(
      EventTag.TypeOfEvent.Concert,
      EventTag.VenueType.Theatre,
      EventTag.MusicGenre.Jazz,
      EventTag.Theme.Festival,
      EventTag.Target.Students
    )
    val command = correctCreateEventDraftCommand(tag = multipleTags)

    val eventId = service.handleCreateDraft(command)
    eventId should not be empty

  it should "handle command with empty tag list" in:
    val command = correctCreateEventDraftCommand(tag = List.empty)

    val eventId = service.handleCreateDraft(command)
    eventId should not be empty

  it should "return validation error for invalid command" in:
    val invalidCommand = correctCreateEventDraftCommand(title = "")

    val result = service.handleCreateDraft(invalidCommand)
    result should startWith("Validation failed")

  it should "return validation error for past date" in:
    val pastDate       = LocalDateTime.of(2020, 1, 1, 12, 0)
    val invalidCommand = correctCreateEventDraftCommand(date = pastDate)

    val result = service.handleCreateDraft(invalidCommand)
    result should startWith("Validation failed")

  it should "reject empty description" in:
    val invalidCommand = correctCreateEventDraftCommand(description = "")

    val result = service.handleCreateDraft(invalidCommand)
    result should startWith("Validation failed")

  it should "reject empty location" in:
    val invalidCommand = correctCreateEventDraftCommand(location = "")

    val result = service.handleCreateDraft(invalidCommand)
    result should startWith("Validation failed")

  it should "reject empty creator id" in:
    val invalidCommand = correctCreateEventDraftCommand(id_creator = "")

    val result = service.handleCreateDraft(invalidCommand)
    result should startWith("Validation failed")
