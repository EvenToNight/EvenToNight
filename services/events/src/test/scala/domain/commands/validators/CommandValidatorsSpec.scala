package domain.commands.validators

import domain.commands.*
import domain.enums.EventStatus
import infrastructure.dto.Location
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

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

  it should "accept valid PUBLISHED command" in {
    val location = Location(
      name = None,
      country = Some("Italy"),
      country_code = Some("IT"),
      state = None,
      province = None,
      city = Some("Rome"),
      road = Some("Via Roma"),
      postcode = Some("00100"),
      house_number = None,
      lat = Some(41.9028),
      lon = Some(12.4964),
      link = None
    )

    val command = CreateEventCommand(
      title = Some("Valid Event"),
      description = Some("Description"),
      poster = None,
      tags = None,
      location = Some(location),
      date = Some(LocalDateTime.now().plusDays(1)),
      status = EventStatus.PUBLISHED,
      creatorId = "creator-123",
      collaboratorIds = None
    )

    val result = CreateEventValidator.validate(command)
    result.isRight.shouldBe(true)
  }

  it should "reject PUBLISHED command with missing location" in {
    val command = CreateEventCommand(
      title = Some("Event"),
      description = Some("Description"),
      poster = None,
      tags = None,
      location = None,
      date = Some(LocalDateTime.now().plusDays(1)),
      status = EventStatus.PUBLISHED,
      creatorId = "creator-123",
      collaboratorIds = None
    )

    val result = CreateEventValidator.validate(command)
    result.isLeft.shouldBe(true)
  }
