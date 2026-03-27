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
      title = Some("Title"),
      description = Some("Desc"),
      poster = Some("url"),
      tags = Some(List(EventTag.fromString("CONCERT"))),
      location = Some(loc),
      date = Some(now),
      status = EventStatus.DRAFT,
      creatorId = "org-1",
      collaboratorIds = Some(List("org-2"))
    )
    create.title.shouldBe(Some("Title"))

    val update = UpdateEventCommand(
      eventId = "1",
      title = Some("Title"),
      description = Some("Desc"),
      tags = Some(List(EventTag.fromString("CONCERT"))),
      location = Some(loc),
      date = Some(now),
      status = EventStatus.DRAFT,
      collaboratorIds = Some(List("org-2"))
    )
    update.eventId.shouldBe("1")

    val getFiltered = GetFilteredEventsCommand(
      limit = Some(10),
      offset = Some(0),
      status = Some(List(EventStatus.PUBLISHED)),
      title = Some("Title"),
      tags = Some(List(EventTag.fromString("CONCERT"))),
      startDate = Some(now),
      endDate = Some(now),
      organizationId = Some("org-1"),
      city = Some("Rome"),
      location_name = Some("Colosseum"),
      sortBy = Some("date"),
      sortOrder = Some("asc"),
      query = Some("q"),
      near = Some((10.0, 20.0)),
      other = Some("other"),
      price = Some((0.0, 100.0))
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

  it should "support copy, equality and extractors for command case classes" in {
    val now = LocalDateTime.parse("2031-01-01T10:00:00")
    val loc = Location(Some("Venue"), None, None, None, None, None, None, None, None, None, None, None)

    val createBase = CreateEventCommand(status = EventStatus.DRAFT, creatorId = "creator-1")
    val createCopy = createBase.copy(title = Some("New title"), date = Some(now), location = Some(loc))
    createCopy should not be createBase
    createCopy.productArity shouldBe 9
    val CreateEventCommand(title, _, _, _, location, date, status, creatorId, _) = createCopy
    title shouldBe Some("New title")
    location shouldBe Some(loc)
    date shouldBe Some(now)
    status shouldBe EventStatus.DRAFT
    creatorId shouldBe "creator-1"

    val updateBase = UpdateEventCommand("e-1", None, None, None, None, None, EventStatus.DRAFT, None)
    val updateCopy = updateBase.copy(description = Some("desc"), status = EventStatus.PUBLISHED)
    updateCopy.productArity shouldBe 8
    val UpdateEventCommand(eventId, _, description, _, _, _, updateStatus, _) = updateCopy
    eventId shouldBe "e-1"
    description shouldBe Some("desc")
    updateStatus shouldBe EventStatus.PUBLISHED

    val filtered = GetFilteredEventsCommand(
      limit = Some(20),
      offset = Some(5),
      status = Some(List(EventStatus.PUBLISHED)),
      title = Some("Music"),
      tags = Some(List(EventTag.fromString("CONCERT"))),
      startDate = Some(now.minusDays(1)),
      endDate = Some(now.plusDays(1)),
      organizationId = Some("org-1"),
      city = Some("Rome"),
      location_name = Some("Arena"),
      sortBy = Some("date"),
      sortOrder = Some("desc"),
      query = Some("query"),
      near = Some((41.9, 12.5)),
      other = Some("other"),
      price = Some((10.0, 50.0))
    )
    val filteredCopy = filtered.copy(limit = Some(10), offset = Some(0))
    filteredCopy should not be filtered
    filteredCopy.productArity shouldBe 16
    val GetFilteredEventsCommand(limit, offset, _, _, _, _, _, _, city, locationName, _, _, _, near, _, price) =
      filteredCopy
    limit shouldBe Some(10)
    offset shouldBe Some(0)
    city shouldBe Some("Rome")
    locationName shouldBe Some("Arena")
    near shouldBe Some((41.9, 12.5))
    price shouldBe Some((10.0, 50.0))

    GetEventCommand("id-1") shouldBe GetEventCommand("id-1")
    DeleteEventCommand("id-2").productPrefix shouldBe "DeleteEventCommand"
    UpdateEventPosterCommand("id-3", "poster").productPrefix shouldBe "UpdateEventPosterCommand"
    GetAllEventsCommand().productArity shouldBe 0
  }

  it should "cover equals/hashCode branches for commands" in {
    val now = LocalDateTime.parse("2031-02-01T09:00:00")
    val loc = Location(Some("Venue"), None, None, None, None, None, None, None, None, None, None, None)

    val create = CreateEventCommand(
      title = Some("T"),
      description = Some("D"),
      poster = Some("P"),
      tags = Some(List(EventTag.fromString("CONCERT"))),
      location = Some(loc),
      date = Some(now),
      status = EventStatus.PUBLISHED,
      creatorId = "org",
      collaboratorIds = Some(List("c1"))
    )
    create shouldBe create
    create.equals(null) shouldBe false
    create.equals("other") shouldBe false
    create.hashCode shouldBe create.copy().hashCode

    val updatePoster = UpdateEventPosterCommand("e1", "url")
    updatePoster.equals(null) shouldBe false
    updatePoster.equals(12) shouldBe false
    updatePoster.hashCode shouldBe UpdateEventPosterCommand("e1", "url").hashCode

    val getEvent = GetEventCommand("e2")
    getEvent.equals(null) shouldBe false
    getEvent.equals(create) shouldBe false

    val getAll = GetAllEventsCommand()
    getAll.equals(null) shouldBe false
    getAll.equals(getEvent) shouldBe false

    val update = UpdateEventCommand("e3", None, None, None, None, None, EventStatus.DRAFT, None)
    update.equals(null) shouldBe false
    update.equals(getAll) shouldBe false

    val delete = DeleteEventCommand("e4")
    delete.equals(null) shouldBe false
    delete.equals(update) shouldBe false

    val filtered = GetFilteredEventsCommand(
      limit = Some(1),
      offset = Some(0),
      status = Some(List(EventStatus.DRAFT)),
      title = Some("x"),
      tags = Some(List(EventTag.fromString("CONCERT"))),
      startDate = Some(now),
      endDate = Some(now.plusDays(1)),
      organizationId = Some("org"),
      city = Some("Rome"),
      location_name = Some("Arena"),
      sortBy = Some("date"),
      sortOrder = Some("asc"),
      query = Some("q"),
      near = Some((1.0, 2.0)),
      other = Some("o"),
      price = Some((0.0, 10.0))
    )
    filtered.equals(null) shouldBe false
    filtered.equals(delete) shouldBe false
    filtered.hashCode shouldBe filtered.copy().hashCode
  }
