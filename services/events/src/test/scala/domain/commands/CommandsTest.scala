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
    result shouldBe "Command: Pattern Test"

  it should "handle collections" in:
    val commands: List[Commands] = List(
      createCommand("Event 1"),
      createCommand("Event 2")
    )
    commands should have length 2
    commands.foreach(_ shouldBe a[CreateEventDraftCommand])

  it should "support different tag combinations" in:
    val emptyTags = List.empty[EventTag]
    val multipleTags = List(
      EventTag.TypeOfEvent.Concert,
      EventTag.VenueType.Theatre,
      EventTag.MusicGenre.Jazz
    )

    val cmd1 = CreateEventDraftCommand("Empty", "desc", "poster", emptyTags, "loc", baseDate, "creator", None)
    val cmd2 = CreateEventDraftCommand("Multi", "desc", "poster", multipleTags, "loc", baseDate, "creator", None)

    cmd1.tag shouldBe empty
    cmd2.tag should have length 3
