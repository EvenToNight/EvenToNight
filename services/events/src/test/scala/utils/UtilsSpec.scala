package utils
import domain.enums.EventStatus
import infrastructure.dto.Event
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.{Instant, LocalDateTime}

class UtilsSpec extends AnyFlatSpec with Matchers:

  "parseLocationFromJson" should "parse a valid location JSON string" in {
    val json = """{"name":"Rome", "lat": 1.0, "lon": 2.0}"""
    val locOption = Utils.parseLocationFromJson(json)
    locOption.isDefined shouldBe true
    locOption.get.name shouldBe Some("Rome")
    locOption.get.lat shouldBe Some(1.0)
  }

  it should "return None when given an invalid JSON string" in {
    Utils.parseLocationFromJson("{ invalid }").isEmpty shouldBe true
  }

  "notifyPaymentsService" should "return Left if request fails (e.g., unknown host)" in {
    val result = Utils.notifyPaymentsService(
      eventId = "1",
      creatorId = "org-1",
      status = "DRAFT",
      title = None,
      date = None,
      paymentsServiceUrl = "http://invalid-url-domain-not-exists.local"
    )
    result.isLeft shouldBe true
  }

  "getCreateCommandFromJson" should "parse a complete CreateEventCommand" in {
    val json = """{"title":"Concert", "description":"Desc", "tags":"CONCERT", "status":"DRAFT", "creatorId":"org-1", "date":"2027-01-01T20:00:00"}"""
    val cmd = Utils.getCreateCommandFromJson(json)
    cmd.title shouldBe Some("Concert")
    cmd.status shouldBe EventStatus.DRAFT
    cmd.creatorId shouldBe "org-1"
  }

  "getUpdateCommandFromJson" should "parse a complete UpdateEventCommand" in {
    val json = """{"title":"Updated", "status":"PUBLISHED", "collaboratorIds":["org-2"]}"""
    val cmd = Utils.getUpdateCommandFromJson("event-id", json)
    cmd.eventId shouldBe "event-id"
    cmd.title shouldBe Some("Updated")
    cmd.status shouldBe EventStatus.PUBLISHED
    cmd.collaboratorIds shouldBe Some(List("org-2"))
  }

  "updateEventIfPastDate" should "transition a PUBLISHED event to COMPLETED if the date is in the past" in {
    val pastDate = LocalDateTime.now().minusDays(1)
    val event = Event(
      _id = "1", title = Some("Event"), description = None, poster = None, tags = None, 
      date = Some(pastDate), status = EventStatus.PUBLISHED, location = None, 
      instant = Instant.now(), creatorId = "org", collaboratorIds = None, isFree = true
    )
    val updated = Utils.updateEventIfPastDate(event)
    updated.status shouldBe EventStatus.COMPLETED
  }

  it should "NOT transition a DRAFT event even if the date is in the past" in {
    val pastDate = LocalDateTime.now().minusDays(1)
    val event = Event(
      _id = "1", title = Some("Event"), description = None, poster = None, tags = None, 
      date = Some(pastDate), status = EventStatus.DRAFT, location = None, 
      instant = Instant.now(), creatorId = "org", collaboratorIds = None, isFree = true
    )
    val updated = Utils.updateEventIfPastDate(event)
    updated.status shouldBe EventStatus.DRAFT
  }

  "parseEventFilters" should "parse valid filter strings" in {
    val cmd = Utils.parseEventFilters(
      limit = Some(15), offset = Some(5), status = Some(List("DRAFT")), title = Some("Query"),
      tags = Some(List("CONCERT")), startDate = Some("2026-01-01T00:00:00"), endDate = None,
      organizationId = None, city = Some("Rome"), location_name = None, sortBy = Some("date"),
      sortOrder = Some("asc"), query = None, near = Some("41.9, 12.5"), other = None,
      price = Some("0,50"), isAuthenticated = true
    )

    cmd.limit shouldBe Some(15)
    cmd.status shouldBe Some(List(EventStatus.DRAFT))
    cmd.near shouldBe Some((41.9, 12.5))
    cmd.price shouldBe Some((0.0, 50.0))
    cmd.sortBy shouldBe Some("date")
    cmd.sortOrder shouldBe Some("asc")
  }

  it should "default to PUBLISHED status for unauthenticated users" in {
    val cmd = Utils.parseEventFilters(
      limit = None, offset = None, status = None, title = None, tags = None, startDate = None, 
      endDate = None, organizationId = None, city = None, location_name = None, sortBy = None,
      sortOrder = None, query = None, near = None, other = None, price = None, isAuthenticated = false
    )

    cmd.status shouldBe Some(List(EventStatus.PUBLISHED))
  }

  it should "ignore invalid near or price coordinates gracefully" in {
    val cmd = Utils.parseEventFilters(
      limit = None, offset = None, status = None, title = None, tags = None, startDate = None, 
      endDate = None, organizationId = None, city = None, location_name = None, sortBy = None,
      sortOrder = None, query = None, near = Some("invalid,format"), other = None, price = Some("invalid,format"), isAuthenticated = false
    )

    cmd.near.isEmpty shouldBe true
    cmd.price.isEmpty shouldBe true
  }

  "createPaginatedResponse" should "generate a correct JSON response object" in {
    val response = Utils.createPaginatedResponse(List.empty, Some(10), Some(5), hasMore = true)
    response("limit").num shouldBe 10
    response("offset").num shouldBe 5
    response("hasMore").bool shouldBe true
    response("items").arr.length shouldBe 0
  }
