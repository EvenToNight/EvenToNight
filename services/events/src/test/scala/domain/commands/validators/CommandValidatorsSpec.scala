package domain.commands.validators

import domain.commands.CreateEventCommand
import domain.enums.EventStatus
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CommandValidatorsSpec extends AnyFlatSpec with Matchers:

  "CreateEventValidator" should "accept valid DRAFT command" in {
    val command = CreateEventCommand(
      title = Some("Valid Event"),
      description = Some("Description"),
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = "creator-123",
      collaboratorIds = None
    )

    val result = CreateEventValidator.validate(command)
    result.isRight.shouldBe(true)
  }

  it should "reject command with empty creatorId" in {
    val command = CreateEventCommand(
      title = Some("Event"),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = "",
      collaboratorIds = None
    )

    val result = CreateEventValidator.validate(command)
    result.isLeft.shouldBe(true)
  }

  it should "accept DRAFT without all fields" in {
    val command = CreateEventCommand(
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = "creator-123",
      collaboratorIds = None
    )

    val result = CreateEventValidator.validate(command)
    result.isRight.shouldBe(true)
  }
