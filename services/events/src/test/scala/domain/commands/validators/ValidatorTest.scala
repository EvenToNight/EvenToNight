package domain.commands.validators

import domain.commands.{
  CreateEventCommand,
  DeleteEventCommand,
  GetEventCommand,
  GetFilteredEventsCommand,
  UpdateEventCommand,
  UpdateEventPosterCommand
}
import domain.models.{EventStatus, EventTag, Location}
import org.scalatest.BeforeAndAfterEach
import org.scalatest.EitherValues.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class ValidatorTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private val pastDate: LocalDateTime = LocalDateTime.now().minusDays(1)

  private def validCreateEventCommand(
      title: Option[String] = Some("Valid Title"),
      description: String = "Valid Description",
      location: Location = Location.create(
        country = Some("Valid Country"),
        country_code = Some("VC"),
        road = Some("Valid Road"),
        postcode = Some("12345"),
        house_number = Some("1A"),
        lat = Some(10.0),
        lon = Some(20.0),
        link = Some("http://valid-link.com")
      ),
      date: LocalDateTime = LocalDateTime.now().plusDays(10),
      status: EventStatus = EventStatus.DRAFT,
      creatorId: String = "valid-creator-id"
  ): CreateEventCommand =
    CreateEventCommand(
      title = title,
      description = Some(description),
      poster = Some("valid-poster.jpg"),
      tags = Some(List(EventTag.Venue.Bar)),
      location = Some(location),
      date = Some(date),
      status = status,
      creatorId = creatorId,
      collaboratorIds = None
    )

  private def validGetFilteredEventsCommand(
      limit: Option[Int] = Some(10),
      offset: Option[Int] = Some(0),
      status: Option[List[EventStatus]] = Some(List(EventStatus.PUBLISHED)),
      title: Option[String] = Some("Sample Event"),
      tags: Option[List[EventTag]] = Some(List(EventTag.EventType.Concert)),
      startDate: Option[LocalDateTime] = Some(LocalDateTime.now().plusDays(1)),
      endDate: Option[LocalDateTime] = Some(LocalDateTime.now().plusDays(30)),
      organizationId: Option[String] = Some("org-123"),
      city: Option[String] = Some("Sample City"),
      location_name: Option[String] = Some("Sample Venue"),
      sortBy: Option[String] = Some("date"),
      sortOrder: Option[String] = Some("asc")
  ): GetFilteredEventsCommand =
    GetFilteredEventsCommand(
      limit = limit,
      offset = offset,
      status = status,
      title = title,
      tags = tags,
      startDate = startDate,
      endDate = endDate,
      organizationId = organizationId,
      city = city,
      location_name = location_name,
      sortBy = sortBy,
      sortOrder = sortOrder
    )

  "CreateEventValidator" should "extends Validator trait" in:
    val validator = CreateEventValidator
    validator shouldBe a[Validator[CreateEventCommand]]

  it should "validate create event command successfully" in:
    val command = validCreateEventCommand()
    val result  = CreateEventValidator.validate(command)

    result shouldBe Right(command)

  "CreateEventValidator with Draft status" should "accept empty title" in:
    val command = validCreateEventCommand(title = None)
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Right[?, ?]]

  it should "accept empty description" in:
    val command = validCreateEventCommand(description = "")
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Right[?, ?]]

  it should "accept empty location" in:
    val command = validCreateEventCommand(location = Location.Nil())
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Right[?, ?]]

  it should "reject empty creator id" in:
    val command = validCreateEventCommand(creatorId = "")
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Creator Id cannot be empty")

  it should "accept past date" in:
    val command = validCreateEventCommand(date = pastDate)
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Right[?, ?]]

  "CreateEventValidator with Published status" should "reject empty title" in:
    val command = validCreateEventCommand(status = EventStatus.PUBLISHED, title = None)
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Title cannot be empty")

  it should "reject empty description" in:
    val command = validCreateEventCommand(status = EventStatus.PUBLISHED, description = "")
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Description cannot be empty")

  it should "reject empty location" in:
    val command = validCreateEventCommand(status = EventStatus.PUBLISHED, location = Location.Nil())
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Location has invalid parameters")

  it should "reject empty creator id" in:
    val command = validCreateEventCommand(status = EventStatus.PUBLISHED, creatorId = "")
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Creator Id cannot be empty")

  it should "reject past date" in:
    val command = validCreateEventCommand(status = EventStatus.PUBLISHED, date = pastDate)
    val result  = CreateEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Date must be in the future")

  it should "collect multiple validation errors" in:
    val command = validCreateEventCommand(
      title = None,
      description = "",
      location = Location.Nil(),
      date = pastDate,
      status = EventStatus.PUBLISHED
    )
    val result = CreateEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    val errors = result.left.value
    errors should have length 4
    errors should contain allOf (
      "Title cannot be empty",
      "Description cannot be empty",
      "Location has invalid parameters",
      "Date must be in the future"
    )

  "GetEventValidator" should "extend Validator trait" in:
    val validator = GetEventValidator
    validator shouldBe a[Validator[GetEventCommand]]

  it should "validate valid event ID successfully" in:

    val command = GetEventCommand("valid-event-id-123")
    val result  = GetEventValidator.validate(command)

    result shouldBe Right(command)

  it should "reject empty event ID" in:
    import domain.commands.GetEventCommand

    val command = GetEventCommand("")
    val result  = GetEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Event ID cannot be empty")

  "UpdateEventPosterValidator" should "extend Validator trait" in:
    val validator = UpdateEventPosterValidator
    validator shouldBe a[Validator[UpdateEventPosterCommand]]

  it should "validate valid command successfully" in:

    val command = UpdateEventPosterCommand("valid-event-123", "https://example.com/poster.jpg")
    val result  = UpdateEventPosterValidator.validate(command)

    result shouldBe Right(command)

  it should "reject empty event ID" in:
    import domain.commands.UpdateEventPosterCommand

    val command = UpdateEventPosterCommand("", "https://example.com/poster.jpg")
    val result  = UpdateEventPosterValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Event ID cannot be empty")

  it should "reject empty poster URL" in:
    import domain.commands.UpdateEventPosterCommand

    val command = UpdateEventPosterCommand("valid-event-123", "")
    val result  = UpdateEventPosterValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Poster URL cannot be empty")

  "UpdateEventValidator" should "extend Validator trait" in:
    val validator = UpdateEventValidator
    validator shouldBe a[Validator[UpdateEventCommand]]

  it should "validate valid command successfully" in:
    val command = UpdateEventCommand(
      "valid-event-123",
      Some("Updated Title"),
      None,
      None,
      None,
      None,
      EventStatus.DRAFT,
      None
    )
    val result = UpdateEventValidator.validate(command)

    result shouldBe Right(command)

  it should "reject empty event ID" in:
    import domain.commands.UpdateEventCommand
    val command = UpdateEventCommand("", Some("Updated Title"), None, None, None, None, EventStatus.DRAFT, None)
    val result  = UpdateEventValidator.validate(command)
    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Event ID cannot be empty")

  it should "reject empty title when status is Published" in:
    val command = UpdateEventCommand("valid-event-123", None, None, None, None, None, EventStatus.PUBLISHED, None)
    val result  = UpdateEventValidator.validate(command)
    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Title cannot be empty")

  it should "reject empty description when status is Published" in:
    val command = UpdateEventCommand(
      "valid-event-123",
      Some("Updated Title"),
      None,
      None,
      None,
      None,
      EventStatus.PUBLISHED,
      None
    )
    val result = UpdateEventValidator.validate(command)
    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Description cannot be empty")

  it should "collect multiple validation errors when status is Published" in:
    val command = UpdateEventCommand("valid-event-123", None, None, None, None, None, EventStatus.PUBLISHED, None)
    val result  = UpdateEventValidator.validate(command)
    result shouldBe a[Left[?, ?]]
    val errors = result.left.value
    errors should contain allOf (
      "Title cannot be empty",
      "Description cannot be empty",
      "Location has invalid parameters",
      "Date must be in the future"
    )

  "DeleteEventValidator" should "extend Validator trait" in:
    val validator = DeleteEventValidator
    validator shouldBe a[Validator[DeleteEventCommand]]

  it should "validate valid command successfully" in:
    val command = DeleteEventCommand("valid-event-123")
    val result  = DeleteEventValidator.validate(command)
    result shouldBe Right(command)

  it should "reject empty event ID" in:
    import domain.commands.DeleteEventCommand
    val command = DeleteEventCommand("")
    val result  = DeleteEventValidator.validate(command)
    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Event ID cannot be empty")

  "GetFilteredEventsValidator" should "extend Validator trait" in:
    val validator = GetFilteredEventsValidator
    validator shouldBe a[Validator[GetFilteredEventsCommand]]

  it should "validate valid command successfully" in:
    val command = validGetFilteredEventsCommand()
    val result  = GetFilteredEventsValidator.validate(command)
    result shouldBe Right(command)

  it should "reject negative limit" in:
    val command = validGetFilteredEventsCommand(limit = Some(-5))
    val result  = GetFilteredEventsValidator.validate(command)
    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Limit must be positive")

  it should "reject negative offset" in:
    val command = validGetFilteredEventsCommand(offset = Some(-1))
    val result  = GetFilteredEventsValidator.validate(command)
    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Offset cannot be negative")

  it should "reject end date before start date" in:
    val start = LocalDateTime.now().plusDays(10)
    val end   = LocalDateTime.now().plusDays(5)
    val command = validGetFilteredEventsCommand(
      startDate = Some(start),
      endDate = Some(end)
    )
    val result = GetFilteredEventsValidator.validate(command)
    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Date range: start date must be before end date")
