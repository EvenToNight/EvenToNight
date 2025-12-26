package domain.commands.validators

import domain.commands.{
  CreateEventCommand,
  DeleteEventCommand,
  GetEventCommand,
  UpdateEventCommand,
  UpdateEventPosterCommand
}
import domain.models.{EventStatus, EventTag, Location}
import org.scalatest.EitherValues.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class ValidatorInstancesTest extends AnyFlatSpec with Matchers:

  import ValidatorsInstances.given

  private val validLocation = Location(
    name = Some("Test Venue"),
    country = Some("Test Country"),
    country_code = Some("TC"),
    state = Some("Test State"),
    province = Some("Test Province"),
    city = Some("Test City"),
    road = Some("Test Road"),
    postcode = Some("12345"),
    house_number = Some("1"),
    lat = Some(45.0),
    lon = Some(9.0),
    link = Some("https://test.com")
  )

  private val validCreateCommand = CreateEventCommand(
    title = Some("Test Event"),
    description = Some("Test Description"),
    poster = Some("test.jpg"),
    tags = Some(List(EventTag.EventType.Concert, EventTag.MusicStyle.Rock)),
    location = Some(validLocation),
    date = Some(LocalDateTime.now().plusDays(7)),
    price = Some(25.0),
    status = EventStatus.PUBLISHED,
    creatorId = "creator123",
    collaboratorIds = Some(List("collaborator456"))
  )

  private val validGetCommand = GetEventCommand("event123")

  private val validUpdateCommand = UpdateEventPosterCommand(
    eventId = "event123",
    posterUrl = "https://example.com/poster.jpg"
  )

  private val validUpdateEventCommand = UpdateEventCommand(
    eventId = "event123",
    title = Some("Updated Event Title"),
    description = Some("Updated Description"),
    tags = Some(List(EventTag.EventType.Concert, EventTag.MusicStyle.Rock)),
    location = Some(validLocation),
    date = Some(LocalDateTime.now().plusDays(14)),
    price = Some(30.0),
    status = EventStatus.PUBLISHED,
    collaboratorIds = Some(List("collaborator789"))
  )

  private def validDeleteEventCommand = DeleteEventCommand("event123")

  "ValidatorsInstances" should "provide given instance for CreateEventDraftCommand" in:
    val validator = summon[Validator[CreateEventCommand]]
    validator should not be null
    validator shouldBe CreateEventValidator

  it should "provide given instance for GetEventCommand" in:
    val validator = summon[Validator[GetEventCommand]]
    validator should not be null
    validator shouldBe GetEventValidator

  it should "provide given instance for UpdateEventPosterCommand" in:
    val validator = summon[Validator[UpdateEventPosterCommand]]
    validator should not be null
    validator shouldBe UpdateEventPosterValidator

  it should "provide given instance for UpdateEventCommand" in:
    val validator = summon[Validator[UpdateEventCommand]]
    validator should not be null
    validator shouldBe UpdateEventValidator

  it should "provide given instance for DeleteEventCommand" in:
    val validator = summon[Validator[DeleteEventCommand]]
    validator should not be null
    validator shouldBe DeleteEventValidator

  "Validator.validateCommand with given instances" should "validate valid commands successfully" in:
    Validator.validateCommand(validCreateCommand) shouldBe Right(validCreateCommand)
    Validator.validateCommand(validGetCommand) shouldBe Right(validGetCommand)
    Validator.validateCommand(validUpdateCommand) shouldBe Right(validUpdateCommand)
    Validator.validateCommand(validUpdateEventCommand) shouldBe Right(validUpdateEventCommand)
    Validator.validateCommand(validDeleteEventCommand) shouldBe Right(validDeleteEventCommand)

  it should "fail validation for invalid commands" in:
    val invalidCreateCommand = validCreateCommand.copy(title = None, creatorId = "")
    val result               = Validator.validateCommand(invalidCreateCommand)

    result.isLeft shouldBe true
    val errors = result.left.value
    errors should contain("Title cannot be empty")
    errors should contain("Creator Id cannot be empty")
