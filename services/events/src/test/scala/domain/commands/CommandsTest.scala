package domain.commands

import domain.models.EventTag
import domain.models.Location
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import scala.compiletime.uninitialized

class CommandsTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private var baseDate: LocalDateTime    = uninitialized
  private var sampleTags: List[EventTag] = uninitialized
  private var sampleLocation: Location   = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    baseDate = LocalDateTime.of(2025, 12, 31, 20, 0)
    sampleTags = List(EventTag.TypeOfEvent.Party, EventTag.VenueType.Club)
    sampleLocation = Location.create(
      country = "Test Country",
      country_code = "TC",
      road = "Test Road",
      postcode = "12345",
      house_number = "10A",
      lat = 45.0,
      lon = 90.0,
      link = "http://example.com/location"
    )

  private def createCommand(
      title: String = "Test Event",
      id_collaborator: Option[String] = Some("collaborator-456")
  ): CreateEventDraftCommand =
    CreateEventDraftCommand(
      title,
      "Test description",
      "poster.jpg",
      sampleTags,
      sampleLocation,
      baseDate,
      15.0,
      "creator-123",
      id_collaborator
    )

  private def getCommand(id_event: String): GetEventCommand =
    GetEventCommand(id_event)

  private def updatePosterCommand(
      id_event: String = "event-123",
      posterUrl: String = "https://example.com/poster.jpg"
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(id_event, posterUrl)

  "CreateEventDraftCommand" should "implement Commands trait" in:
    val command = createCommand()
    command shouldBe a[Commands]
    command shouldBe a[CreateEventDraftCommand]

  it should "store properties correctly" in:
    val command = createCommand("Custom Title", None)
    command.title shouldBe "Custom Title"
    command.id_collaborator shouldBe None
    command.tag shouldBe sampleTags
    command.location shouldBe sampleLocation
    command.date shouldBe baseDate

  it should "support pattern matching" in:
    val command: Commands = createCommand("Pattern Test")
    val result = command match
      case CreateEventDraftCommand(title, _, _, _, _, _, _, _, _) => s"Command: $title"
      case GetEventCommand(id_event)                              => s"Get Command: $id_event"
      case UpdateEventPosterCommand(id_event, posterUrl)          => s"Update Poster Command: $id_event"
      case GetAllEventsCommand()                                  => "Get All Events Command"
    result shouldBe "Command: Pattern Test"

  "GetEventCommand" should "implement Commands trait" in:
    val command = getCommand("event-789")
    command shouldBe a[Commands]
    command shouldBe a[GetEventCommand]

  it should "store properties correctly" in:
    val command = getCommand("event-123")
    command.id_event shouldBe "event-123"

  "UpdateEventPosterCommand" should "implement Commands trait" in:
    val command = updatePosterCommand()
    command shouldBe a[Commands]
    command shouldBe a[UpdateEventPosterCommand]

  it should "store properties correctly" in:
    val command = updatePosterCommand("custom-event-456", "https://custom.com/poster.png")
    command.id_event shouldBe "custom-event-456"
    command.posterUrl shouldBe "https://custom.com/poster.png"

  "GetAllEventsCommand" should "implement Commands trait" in:
    val command = GetAllEventsCommand()
    command shouldBe a[Commands]
    command shouldBe a[GetAllEventsCommand]
