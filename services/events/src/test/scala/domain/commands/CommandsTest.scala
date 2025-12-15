package domain.commands

import domain.models.{EventStatus, EventTag, Location}
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
      country = Some("Test Country"),
      country_code = Some("TC"),
      road = Some("Test Road"),
      postcode = Some("12345"),
      house_number = Some("10A"),
      lat = Some(45.0),
      lon = Some(90.0),
      link = Some("http://example.com/location")
    )

  private def createCommand(
      title: String = "Test Event",
      id_collaborators: Option[List[String]] = Some(List("collaborator-456"))
  ): CreateEventCommand =
    CreateEventCommand(
      Some(title),
      Some("Test description"),
      Some("poster.jpg"),
      Some(sampleTags),
      Some(sampleLocation),
      Some(baseDate),
      Some(15.0),
      EventStatus.DRAFT,
      "creator-123",
      id_collaborators
    )

  private def getCommand(id_event: String): GetEventCommand =
    GetEventCommand(id_event)

  private def updatePosterCommand(
      id_event: String = "event-123",
      posterUrl: String = "https://example.com/poster.jpg"
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(id_event, posterUrl)

  private def getFilteredEventsCommand(): GetFilteredEventsCommand =
    GetFilteredEventsCommand(
      limit = Some(5),
      offset = Some(0),
      status = Some(EventStatus.PUBLISHED),
      title = Some("Sample"),
      tags = Some(List(EventTag.TypeOfEvent.Concert)),
      startDate = Some(baseDate),
      endDate = Some(baseDate.plusDays(10)),
      id_organization = Some("org-456"),
      city = Some("Sample City"),
      location_name = Some("Sample Venue"),
      priceRange = Some((10.0, 50.0))
    )

  "CreateEventDraftCommand" should "implement Commands trait" in:
    val command = createCommand()
    command shouldBe a[Commands]
    command shouldBe a[CreateEventCommand]

  it should "store properties correctly" in:
    val command = createCommand("Custom Title", None)
    command.title shouldBe Some("Custom Title")
    command.id_collaborators shouldBe None
    command.tags shouldBe Some(sampleTags)
    command.location shouldBe Some(sampleLocation)
    command.date shouldBe Some(baseDate)

  it should "handle optional fields correctly" in:
    val command = CreateEventCommand(status = EventStatus.DRAFT, id_creator = "creator-999")
    command.title shouldBe None
    command.description shouldBe None
    command.poster shouldBe None
    command.tags shouldBe None
    command.location shouldBe None
    command.date shouldBe None
    command.price shouldBe None
    command.status shouldBe EventStatus.DRAFT
    command.id_creator shouldBe "creator-999"
    command.id_collaborators shouldBe None

  it should "support pattern matching" in:
    val command: Commands = createCommand("Pattern Test")
    val result = command match
      case CreateEventCommand(title, _, _, _, _, _, _, _, _, _)      => "Command: " + title.getOrElse("No Title")
      case GetEventCommand(id_event)                                 => s"Get Command: $id_event"
      case UpdateEventPosterCommand(id_event, posterUrl)             => s"Update Poster Command: $id_event"
      case GetAllEventsCommand()                                     => "Get All Events Command"
      case UpdateEventCommand(id, _, _, _, _, _, _, _, _)            => s"Update $id Event Command"
      case DeleteEventCommand(id_event)                              => s"Delete Command: $id_event"
      case GetFilteredEventsCommand(_, _, _, _, _, _, _, _, _, _, _) => "Get Filtered Events Command"
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

  "UpdateEventCommand" should "implement Commands trait" in:
    val command = UpdateEventCommand(
      id_event = "event-321",
      title = Some("Updated Title"),
      description = None,
      tags = None,
      location = None,
      date = None,
      price = Some(20.0),
      status = EventStatus.PUBLISHED,
      id_collaborators = Some(List("collaborator-789"))
    )
    command shouldBe a[Commands]
    command shouldBe a[UpdateEventCommand]

  it should "store properties correctly" in:
    val command = UpdateEventCommand(
      id_event = "event-654",
      title = Some("New Title"),
      description = Some("New Description"),
      tags = Some(List(EventTag.TypeOfEvent.Concert)),
      location = Some(sampleLocation),
      date = Some(baseDate.plusDays(5)),
      price = Some(30.0),
      status = EventStatus.CANCELLED,
      id_collaborators = None
    )
    command.id_event shouldBe "event-654"
    command.title shouldBe Some("New Title")
    command.description shouldBe Some("New Description")
    command.tags shouldBe Some(List(EventTag.TypeOfEvent.Concert))
    command.location shouldBe Some(sampleLocation)
    command.date shouldBe Some(baseDate.plusDays(5))
    command.price shouldBe Some(30.0)
    command.status shouldBe EventStatus.CANCELLED
    command.id_collaborators shouldBe None

  "DeleteEventCommand" should "implement Commands trait" in:
    val command = DeleteEventCommand("event-to-delete")
    command shouldBe a[Commands]
    command shouldBe a[DeleteEventCommand]

  it should "store properties correctly" in:
    val command = DeleteEventCommand("event-999")
    command.id_event shouldBe "event-999"

  "GetFilteredEventsCommand" should "implement Commands trait" in:
    val command = getFilteredEventsCommand()
    command shouldBe a[Commands]
    command shouldBe a[GetFilteredEventsCommand]

  it should "store properties correctly" in:
    val command = getFilteredEventsCommand()
    command.limit shouldBe Some(5)
    command.offset shouldBe Some(0)
    command.status shouldBe Some(EventStatus.PUBLISHED)
    command.title shouldBe Some("Sample")
    command.tags shouldBe Some(List(EventTag.TypeOfEvent.Concert))
    command.startDate shouldBe Some(baseDate)
    command.endDate shouldBe Some(baseDate.plusDays(10))
    command.id_organization shouldBe Some("org-456")
    command.city shouldBe Some("Sample City")
    command.location_name shouldBe Some("Sample Venue")
