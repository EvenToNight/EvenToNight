package domain.commands.validators

import domain.commands.CreateEventDraftCommand
import domain.models.EventTag
import org.scalatest.BeforeAndAfterEach
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import scala.compiletime.uninitialized

class ValidatorTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private var futureDate: LocalDateTime  = uninitialized
  private var pastDate: LocalDateTime    = uninitialized
  private var sampleTags: List[EventTag] = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    futureDate = LocalDateTime.now().plusDays(7)
    pastDate = LocalDateTime.now().minusDays(1)
    sampleTags = List(EventTag.TypeOfEvent.Party, EventTag.VenueType.Club)

  private def createValidCommand(
      title: String = "Valid Event",
      description: String = "Valid description",
      location: String = "Valid Location",
      date: LocalDateTime = null,
      id_creator: String = "creator-123"
  ): CreateEventDraftCommand =
    val eventDate = if date != null then date else futureDate
    CreateEventDraftCommand(
      title = title,
      description = description,
      poster = "poster.jpg",
      tag = sampleTags,
      location = location,
      date = eventDate,
      id_creator = id_creator,
      id_collaborator = None
    )

  "CreateEventDraftValidator" should "validate valid command successfully" in:
    val command = createValidCommand()
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe Right(command)

  it should "reject empty title" in:
    val command = createValidCommand(title = "")
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Title cannot be empty")

  it should "reject empty description" in:
    val command = createValidCommand(description = "")
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Description cannot be empty")

  it should "reject empty location" in:
    val command = createValidCommand(location = "")
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Location cannot be empty")

  it should "reject empty creator id" in:
    val command = createValidCommand(id_creator = "")
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Creator Id cannot be empty")

  it should "reject past date" in:
    val command = createValidCommand(date = pastDate)
    val result  = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Date must be in the future")

  it should "collect multiple validation errors" in:
    val command = createValidCommand(
      title = "",
      description = "",
      location = "",
      date = pastDate
    )
    val result = CreateEventDraftValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    val errors = result.left.value
    errors should have length 4
    errors should contain allOf (
      "Title cannot be empty",
      "Description cannot be empty",
      "Location cannot be empty",
      "Date must be in the future"
    )

  "Validator trait with given instance" should "work with validateCommand" in:
    import ValidatorsInstances.given

    val validCommand   = createValidCommand()
    val invalidCommand = createValidCommand(title = "")

    val result1 = Validator.validateCommand(validCommand)
    val result2 = Validator.validateCommand(invalidCommand)

    result1 shouldBe Right(validCommand)
    result2 shouldBe a[Left[?, ?]]

  "GetEventValidator" should "validate valid event ID successfully" in:
    import domain.commands.GetEventCommand

    val command = GetEventCommand("valid-event-id-123")
    val result  = GetEventValidator.validate(command)

    result shouldBe Right(command)

  it should "reject empty event ID" in:
    import domain.commands.GetEventCommand

    val command = GetEventCommand("")
    val result  = GetEventValidator.validate(command)

    result shouldBe a[Left[?, ?]]
    result.left.value should contain("Event ID cannot be empty")

  "UpdateEventPosterValidator" should "validate valid command successfully" in:
    import domain.commands.UpdateEventPosterCommand

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

  "Validator trait with GetEventCommand" should "work with validateCommand using given instance" in:
    import domain.commands.GetEventCommand
    import ValidatorsInstances.given

    val validCommand   = GetEventCommand("valid-id")
    val invalidCommand = GetEventCommand("")

    val result1 = Validator.validateCommand(validCommand)
    val result2 = Validator.validateCommand(invalidCommand)

    result1 shouldBe Right(validCommand)
    result2 shouldBe a[Left[?, ?]]
    result2.left.value should contain("Event ID cannot be empty")
