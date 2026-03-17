package domain.commands

import domain.enums.{EventStatus, EventTag}
import infrastructure.dto.Location
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class CommandsSpec extends AnyFlatSpec with Matchers:

  "Commands" should "be correctly instantiated to cover getters and setters" in {
    val now = LocalDateTime.now()
    val loc = Location(Some("Name"), None, None, None, None, None, None, None, None, None, None, None)
    
    val create = CreateEventCommand(
      title = Some("Title"), description = Some("Desc"), poster = Some("url"), tags = Some(List(EventTag.fromString("CONCERT"))),
      location = Some(loc), date = Some(now), status = EventStatus.DRAFT, creatorId = "org-1", collaboratorIds = Some(List("org-2"))
    )
    create.title.shouldBe(Some("Title"))

    val update = UpdateEventCommand(
      eventId = "1", title = Some("Title"), description = Some("Desc"), tags = Some(List(EventTag.fromString("CONCERT"))),
      location = Some(loc), date = Some(now), status = EventStatus.DRAFT, collaboratorIds = Some(List("org-2"))
    )
    update.eventId.shouldBe("1")

    val getFiltered = GetFilteredEventsCommand(
      limit = Some(10), offset = Some(0), status = Some(List(EventStatus.PUBLISHED)), title = Some("Title"),
      tags = Some(List(EventTag.fromString("CONCERT"))), startDate = Some(now), endDate = Some(now), organizationId = Some("org-1"),
      city = Some("Rome"), location_name = Some("Colosseum"), sortBy = Some("date"), sortOrder = Some("asc"),
      query = Some("q"), near = Some((10.0, 20.0)), other = Some("other"), price = Some((0.0, 100.0))
    )
    getFiltered.limit.shouldBe(Some(10))

    val updatePoster = UpdateEventPosterCommand("1", "url")
    updatePoster.posterUrl shouldBe "url"

    val delete = DeleteEventCommand("1")
    delete.eventId shouldBe "1"

    val get = GetEventCommand("1")
    get.eventId shouldBe "1"

    val getAll = GetAllEventsCommand()
    getAll.isInstanceOf[GetAllEventsCommand] shouldBe true
  }
