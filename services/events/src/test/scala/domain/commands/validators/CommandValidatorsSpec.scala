package domain.commands.validators

import domain.commands._
import domain.enums.EventStatus
import infrastructure.dto.Location
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class CommandValidatorsSpec extends AnyFlatSpec with Matchers:

  "Validator combine" should "aggregate errors or return ok" in {
    Validator.combine(Right("ok"), Right("ok2")) shouldBe Right(())
    Validator.combine(Right("ok"), Left("err1"), Left("err2")) shouldBe Left(List("err1", "err2"))
  }

  "CreateEventValidator" should "accept valid DRAFT command" in {
    val command = CreateEventCommand(status = EventStatus.DRAFT, creatorId = "creator-123")
    val result = CreateEventValidator.validate(command)
    result.isRight shouldBe true
  }

  it should "reject DRAFT command with empty creatorId" in {
    val command = CreateEventCommand(status = EventStatus.DRAFT, creatorId = "")
    CreateEventValidator.validate(command).isLeft shouldBe true
  }

  it should "validate fields for non-DRAFT command" in {
    val validLoc = Location(country = Some("IT"), country_code = Some("IT"), road = Some("R"), postcode = Some("0"), lat = Some(0.0), lon = Some(0.0), name = None, state = None, province = None, city = None, house_number = None, link = None)
    val validDate = LocalDateTime.now().plusDays(1)
    
    val validCmd = CreateEventCommand(
      title = Some("Title"), description = Some("Desc"), creatorId = "org-1",
      location = Some(validLoc), date = Some(validDate), status = EventStatus.PUBLISHED
    )
    CreateEventValidator.validate(validCmd).isRight shouldBe true

    val invalidCmd = CreateEventCommand(
      title = None, description = None, creatorId = "",
      location = None, date = Some(LocalDateTime.now().minusDays(1)), status = EventStatus.PUBLISHED
    )
    val errs = CreateEventValidator.validate(invalidCmd).left.toOption.get
    errs.size shouldBe 5 // title, desc, creatorId, location, date
  }

  "GetEventValidator" should "require eventId" in {
    GetEventValidator.validate(GetEventCommand("1")).isRight shouldBe true
    GetEventValidator.validate(GetEventCommand("")).isLeft shouldBe true
  }

  "UpdateEventPosterValidator" should "require eventId and posterUrl" in {
    UpdateEventPosterValidator.validate(UpdateEventPosterCommand("1", "url")).isRight shouldBe true
    UpdateEventPosterValidator.validate(UpdateEventPosterCommand("", "url")).isLeft shouldBe true
    UpdateEventPosterValidator.validate(UpdateEventPosterCommand("1", "")).isLeft shouldBe true
  }

  "UpdateEventValidator" should "validate DRAFT and non-DRAFT" in {
    val draftCmd = UpdateEventCommand("1", None, None, None, None, None, EventStatus.DRAFT, None)
    UpdateEventValidator.validate(draftCmd).isRight shouldBe true

    val invalidDraft = draftCmd.copy(eventId = "")
    UpdateEventValidator.validate(invalidDraft).isLeft shouldBe true

    val validLoc = Location(country = Some("IT"), country_code = Some("IT"), road = Some("R"), postcode = Some("0"), lat = Some(0.0), lon = Some(0.0), name = None, state = None, province = None, city = None, house_number = None, link = None)
    val publishedCmd = UpdateEventCommand("1", Some("Title"), Some("Desc"), None, Some(validLoc), Some(LocalDateTime.now().plusDays(1)), EventStatus.PUBLISHED, None)
    UpdateEventValidator.validate(publishedCmd).isRight shouldBe true
  }

  "DeleteEventValidator" should "require eventId" in {
    DeleteEventValidator.validate(DeleteEventCommand("1")).isRight shouldBe true
    DeleteEventValidator.validate(DeleteEventCommand("")).isLeft shouldBe true
  }

  "GetFilteredEventsValidator" should "validate limits, offsets and dates" in {
    val valid = GetFilteredEventsCommand(Some(10), Some(0), None, None, None, None, None, None, None, None, None, None, None, None, None, None)
    GetFilteredEventsValidator.validate(valid).isRight shouldBe true

    val invalid = GetFilteredEventsCommand(Some(-1), Some(-1), None, None, None, Some(LocalDateTime.now().plusDays(1)), Some(LocalDateTime.now()), None, None, None, None, None, None, None, None, None)
    GetFilteredEventsValidator.validate(invalid).isLeft shouldBe true
  }

  "ValidatorsInstances" should "provide given instances" in {
    Validator.validateCommand(GetEventCommand("1"))(using ValidatorsInstances.given_Validator_GetEventCommand).isRight shouldBe true
  }
