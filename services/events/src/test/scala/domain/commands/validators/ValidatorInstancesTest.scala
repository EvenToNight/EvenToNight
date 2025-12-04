package domain.commands.validators

import domain.commands.CreateEventCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand
import domain.models.EventStatus
import domain.models.EventTag
import domain.models.Location
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class ValidatorInstancesTest extends AnyFlatSpec with Matchers:

  import ValidatorsInstances.given

  private val validLocation = Location(
    name = "Test Venue",
    country = "Test Country",
    country_code = "TC",
    state = "Test State",
    province = "Test Province",
    city = "Test City",
    road = "Test Road",
    postcode = "12345",
    house_number = "1",
    lat = 45.0,
    lon = 9.0,
    link = "https://test.com"
  )

  private val validCreateCommand = CreateEventCommand(
    title = "Test Event",
    description = "Test Description",
    poster = "test.jpg",
    tag = List(EventTag.TypeOfEvent.Concert, EventTag.MusicGenre.Jazz),
    location = validLocation,
    date = LocalDateTime.now().plusDays(7),
    price = 25.0,
    status = EventStatus.DRAFT,
    id_creator = "creator123",
    id_collaborator = Some("collaborator456")
  )

  private val validGetCommand = GetEventCommand("event123")

  private val validUpdateCommand = UpdateEventPosterCommand(
    id_event = "event123",
    posterUrl = "https://example.com/poster.jpg"
  )

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

  "Validator.validateCommand with given instances" should "validate valid commands successfully" in:
    Validator.validateCommand(validCreateCommand) shouldBe Right(validCreateCommand)
    Validator.validateCommand(validGetCommand) shouldBe Right(validGetCommand)
    Validator.validateCommand(validUpdateCommand) shouldBe Right(validUpdateCommand)

  it should "fail validation for invalid commands" in:
    val invalidCreateCommand = validCreateCommand.copy(title = "", id_creator = "")
    val result               = Validator.validateCommand(invalidCreateCommand)

    result.isLeft shouldBe true
    val errors = result.left.value
    errors should contain("Title cannot be empty")
    errors should contain("Creator Id cannot be empty")

  it should "handle edge cases with minimal valid data" in:
    val minimalLocation = Location(
      name = "A",
      country = "A",
      country_code = "AB",
      state = "A",
      province = "A",
      city = "A",
      road = "A",
      postcode = "1",
      house_number = "1",
      lat = 0.0,
      lon = 0.0,
      link = ""
    )

    val minimalCommand = CreateEventCommand(
      title = "A",
      description = "A",
      poster = "",
      tag = List(),
      location = minimalLocation,
      date = LocalDateTime.now().plusMinutes(1),
      price = 0.0,
      status = EventStatus.DRAFT,
      id_creator = "A",
      id_collaborator = None
    )

    Validator.validateCommand(minimalCommand) shouldBe Right(minimalCommand)
