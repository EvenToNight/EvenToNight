package domain.commands

import domain.models.EventTag
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import scala.compiletime.uninitialized

class CommandsTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private var baseDate: LocalDateTime    = uninitialized
  private var sampleTags: List[EventTag] = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    baseDate = LocalDateTime.of(2025, 12, 31, 20, 0)
    sampleTags = List(EventTag.TypeOfEvent.Party, EventTag.VenueType.Club)

  private def createCommand(
      title: String = "Test Event",
      id_collaborator: Option[String] = Some("collaborator-456")
  ): CreateEventDraftCommand =
    CreateEventDraftCommand(
      title,
      "Test description",
      "poster.jpg",
      sampleTags,
      "Test Location",
      baseDate,
      "creator-123",
      id_collaborator
    )

  private def getCommand(id_event: String): GetEventCommand =
    GetEventCommand(id_event)

  "CreateEventDraftCommand" should "implement Commands trait" in:
    val command = createCommand()
    command shouldBe a[Commands]
    command shouldBe a[CreateEventDraftCommand]

  it should "store properties correctly" in:
    val command = createCommand("Custom Title", None)
    command.title shouldBe "Custom Title"
    command.id_collaborator shouldBe None
    command.tag shouldBe sampleTags

  it should "support pattern matching" in:
    val command: Commands = createCommand("Pattern Test")
    val result = command match
      case CreateEventDraftCommand(title, _, _, _, _, _, _, _) => s"Command: $title"
      case GetEventCommand(id_event)                           => s"Get Command: $id_event"
    result shouldBe "Command: Pattern Test"

  "GetEventCommand" should "implement Commands trait" in:
    val command = getCommand("event-789")
    command shouldBe a[Commands]
    command shouldBe a[GetEventCommand]

  it should "store properties correctly" in:
    val command = getCommand("event-123")
    command.id_event shouldBe "event-123"
