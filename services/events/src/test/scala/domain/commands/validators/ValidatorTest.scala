package domain.commands.validators

import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand
import domain.models.EventTag
import domain.models.Location
import org.scalatest.BeforeAndAfterEach
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class ValidatorTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private val pastDate: LocalDateTime = LocalDateTime.now().minusDays(1)

  private def validCreateEventDraftCommand(
      title: String = "Valid Title",
      description: String = "Valid Description",
      location: Location = Location.create(
        country = "Valid Country",
        country_code = "VC",
        road = "Valid Road",
        postcode = "12345",
        house_number = "1A",
        lat = 10.0,
        lon = 20.0,
        link = "http://valid-link.com"
      ),
      date: LocalDateTime = LocalDateTime.now().plusDays(10),
      price: Double = 20.0,
      id_creator: String = "valid-creator-id"
  ): CreateEventDraftCommand =
    CreateEventDraftCommand(
      title = title,
      description = description,
      poster = "valid-poster.jpg",
      tag = List(EventTag.VenueType.Bar),
      location = location,
      date = date,
      price = price,
      id_creator = id_creator,
      id_collaborator = None
    )

  "CreateEventDraftValidator" should "extends Validator trait" in:
    val validator = CreateEventDraftValidator
    validator shouldBe a[Validator[CreateEventDraftCommand]]

  it should "validate create event draft command successfully" in:
    val command = validCreateEventDraftCommand()
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe Right(command)

  it should "reject empty title" in:
    val command = validCreateEventDraftCommand(title = "")
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Title cannot be empty")

  it should "reject empty description" in:
    val command = validCreateEventDraftCommand(description = "")
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Description cannot be empty")

  it should "reject empty location" in:
    val command = validCreateEventDraftCommand(location = Location.Nil())
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Location has invalid parameters")

  it should "reject empty creator id" in:
    val command = validCreateEventDraftCommand(id_creator = "")
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Creator Id cannot be empty")

  it should "reject past date" in:
    val command = validCreateEventDraftCommand(date = pastDate)
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Date must be in the future")

  it should "collect multiple validation errors" in:
    val command = validCreateEventDraftCommand(
      title = "",
      description = "",
      location = Location.Nil(),
      date = pastDate
    )
    val result = CreateEventDraftValidator.validate(command)

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
