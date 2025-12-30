package utils

import cask.model.FormFile
import domain.models.{Event, EventStatus, EventTag, Location}
import io.undertow.util.HeaderMap
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.nio.file.{Files, Paths}

class UtilsTest extends AnyFlatSpec with Matchers:

  "Utils.parseLocationFromJson" should "parse valid complete JSON location" in:
    val validJson = """{
      "name": "La Scala",
      "country": "Italy",
      "country_code": "IT",
      "state": "Lombardy",
      "province": "Milan",
      "city": "Milano",
      "road": "Via della Scala",
      "postcode": "20121",
      "house_number": "3",
      "lat": 45.4654,
      "lon": 9.1859,
      "link": "https://www.teatroallascala.org"
    }"""

    val location = Utils.parseLocationFromJson(validJson)

    location.get.name.get shouldBe "La Scala"
    location.get.country.get shouldBe "Italy"
    location.get.country_code.get shouldBe "IT"
    location.get.state.get shouldBe "Lombardy"
    location.get.province.get shouldBe "Milan"
    location.get.city.get shouldBe "Milano"
    location.get.road.get shouldBe "Via della Scala"
    location.get.postcode.get shouldBe "20121"
    location.get.house_number.get shouldBe "3"
    location.get.lat.get shouldBe 45.4654
    location.get.lon.get shouldBe 9.1859
    location.get.link.get shouldBe "https://www.teatroallascala.org"

  it should "parse JSON with missing fields" in:
    val partialJson = """{
      "country": "Spain",
      "lat": 40.4168,
      "lon": -3.7038
    }"""

    val location = Utils.parseLocationFromJson(partialJson)

    location.get.country shouldBe Some("Spain")
    location.get.lat shouldBe Some(40.4168)
    location.get.lon shouldBe Some(-3.7038)
    location.get.name shouldBe None
    location.get.city shouldBe None
    location.get.postcode shouldBe None

  it should "handle empty JSON object" in:
    val emptyJson = "{}"

    val location = Utils.parseLocationFromJson(emptyJson)

    location shouldBe Some(Location.Nil())

  it should "handle invalid JSON and return None" in:
    val invalidJson = "{ invalid json structure"

    val location = Utils.parseLocationFromJson(invalidJson)

    location shouldBe None

  it should "handle non-JSON string and return None" in:
    val notJson = "this is not json at all"

    val location = Utils.parseLocationFromJson(notJson)

    location shouldBe None

  it should "handle empty string and return None" in:
    val location = Utils.parseLocationFromJson("")

    location shouldBe None

  "Utils.uploadPosterToMediaService" should "return default URL when FormFile has no filePath" in:
    val eventId             = "test-event-123"
    val formFileWithoutPath = FormFile("test.jpg", None, new HeaderMap())

    val result = Utils.uploadPosterToMediaService(eventId, Some(formFileWithoutPath), "http://media-service")

    result shouldBe "events/default.jpg"

  it should "return default URL when file cannot be read" in:
    val eventId             = "test-event-456"
    val nonExistentPath     = Paths.get("/non/existent/file.jpg")
    val formFileWithBadPath = FormFile("test.jpg", Some(nonExistentPath), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(eventId, Some(formFileWithBadPath), "http://media-service")

    result shouldBe "events/default.jpg"

  it should "return default URL when media service request fails" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val eventId               = "test-event-789"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val invalidMediaServiceUrl = "http://non-existent-service:9999"

    val result = Utils.uploadPosterToMediaService(eventId, Some(formFileWithValidPath), invalidMediaServiceUrl)

    result shouldBe "events/default.jpg"

  it should "handle successful upload simulation" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val eventId               = "test-event-success"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(eventId, Some(formFileWithValidPath), "http://localhost:8080")

    result shouldBe "events/default.jpg"

  it should "handle malformed media service response" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val eventId               = "test-event-malformed"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val result =
      Utils.uploadPosterToMediaService(eventId, Some(formFileWithValidPath), "http://httpbin.org/status/500")

    result shouldBe "events/default.jpg"

  it should "generate correct default URL format" in:
    val eventId             = "special-event-#123"
    val formFileWithoutPath = FormFile("test.jpg", None, new HeaderMap())

    val result = Utils.uploadPosterToMediaService(eventId, Some(formFileWithoutPath), "http://media-service")

    result shouldBe "events/default.jpg"

  "Utils.getCreateCommandFromJson" should "parse valid JSON into CreateEventCommand" in:
    val validJson = """{
      "title": "Sample Event",
      "description": "This is a sample event.",
      "tags": ["Bar", "Rock"],
      "location": {
        "country": "USA",
        "country_code": "US",
        "road": "123 Main St",
        "postcode": "90210",
        "house_number": "1",
        "lat": 34.0522,
        "lon": -118.2437,
        "link": "http://example.com/location"
      },
      "date": "2025-11-15T19:30:00",
      "price": 20.0,
      "status": "DRAFT",
      "creatorId": "creator-001",
      "collaboratorIds": ["collab-001"]
    }"""

    val command = Utils.getCreateCommandFromJson(validJson)

    command.title shouldBe Some("Sample Event")
    command.description shouldBe Some("This is a sample event.")
    command.tags.get should contain allElementsOf List(EventTag.Venue.Bar, EventTag.MusicStyle.Rock)
    command.location.get.country shouldBe Some("USA")
    command.date shouldBe Some(java.time.LocalDateTime.parse("2025-11-15T19:30:00"))
    command.price shouldBe Some(20.0)
    command.status shouldBe EventStatus.DRAFT
    command.creatorId shouldBe "creator-001"
    command.collaboratorIds shouldBe Some(List("collab-001"))

  it should "handle JSON with missing optional fields" in:
    val partialJson = """{
      "title": "Partial Event",
      "description": "This event has missing optional fields.",
      "tags": ["Concert"],
      "location": {
        "country": "UK",
        "country_code": "GB",
        "road": "456 High St",
        "postcode": "SW1A 1AA",
        "house_number": "2B",
        "lat": 51.5074,
        "lon": -0.1278,
        "link": "http://example.com/location"
      },
      "date": "2025-12-01T10:00:00",
      "price": 0.0,
      "status": "PUBLISHED",
      "creatorId": "creator-002"
    }"""
    val command     = Utils.getCreateCommandFromJson(partialJson)
    command.title shouldBe Some("Partial Event")
    command.description shouldBe Some("This event has missing optional fields.")
    command.tags.get should contain(EventTag.EventType.Concert)
    command.location.get.country shouldBe Some("UK")
    command.date shouldBe Some(java.time.LocalDateTime.parse("2025-12-01T" + "10:00:00"))
    command.price shouldBe Some(0.0)
    command.status shouldBe EventStatus.PUBLISHED
    command.creatorId shouldBe "creator-002"
    command.collaboratorIds shouldBe None

  it should "throw on invalid JSON for CreateEventCommand" in:
    val invalidJson = "{ invalid json structure"
    intercept[Exception] {
      Utils.getCreateCommandFromJson(invalidJson)
    }

  it should "throw on non-JSON string for CreateEventCommand" in:
    val notJson = "this is not json at all"
    intercept[Exception] {
      Utils.getCreateCommandFromJson(notJson)
    }

  it should "throw on empty string for CreateEventCommand" in:
    intercept[Exception] {
      Utils.getCreateCommandFromJson("")
    }

  "Utils.getUpdateCommandFromJson" should "parse valid JSON into UpdateEventCommand" in:
    val validJson = """{
      "title": "Updated Event Title",
      "description": "Updated description.",
      "tags": ["Club", "Rock"],
      "location": {
        "country": "Canada",
        "country_code": "CA",
        "road": "789 Queen St",
        "postcode": "M5H 2N2",
        "house_number": "3C",
        "lat": 43.65107,
        "lon": -79.347015,
        "link": "http://example.com/location"
      },
      "date": "2026-01-20T18:00:00",
      "price": 30.0,
      "status": "CANCELLED",
      "collaboratorIds": ["collab-002"]
    }"""

    val command = Utils.getUpdateCommandFromJson("event-123", validJson)

    command.eventId shouldBe "event-123"
    command.title shouldBe Some("Updated Event Title")
    command.description shouldBe Some("Updated description.")
    command.tags.getOrElse(List()) should contain allElementsOf List(EventTag.Venue.Club, EventTag.MusicStyle.Rock)
    command.location.map(_.country).flatten shouldBe Some("Canada")
    command.date shouldBe Some(java.time.LocalDateTime.parse("2026-01-20T18:00:00"))
    command.price shouldBe Some(30.0)
    command.status shouldBe EventStatus.CANCELLED
    command.collaboratorIds shouldBe Some(List("collab-002"))

  it should "handle JSON with missing optional fields" in:
    val partialJson = """{
      "title": "Partially Updated Title",
      "tags": ["Concert"],
      "date": "2026-02-10T12:00:00",
      "status": "DRAFT"
    }"""
    val command     = Utils.getUpdateCommandFromJson("event-456", partialJson)
    command.eventId shouldBe "event-456"
    command.title shouldBe Some("Partially Updated Title")
    command.description shouldBe None
    command.tags.get should contain(EventTag.EventType.Concert)
    command.location shouldBe None
    command.date shouldBe Some(java.time.LocalDateTime.parse("2026-02-10" + "T12:00:00"))
    command.price shouldBe None
    command.status shouldBe EventStatus.DRAFT
    command.collaboratorIds shouldBe None

  it should "throw on invalid JSON for UpdateEventCommand" in:
    val invalidJson = "{ invalid json structure"
    intercept[Exception] {
      Utils.getUpdateCommandFromJson("event-789", invalidJson)
    }

  it should "throw on non-JSON string for UpdateEventCommand" in:
    val notJson = "this is not json at all"
    intercept[Exception] {
      Utils.getUpdateCommandFromJson("event-101", notJson)
    }

  it should "throw on empty string for UpdateEventCommand" in:
    intercept[Exception] {
      Utils.getUpdateCommandFromJson("event-202", "")
    }

  "Utils.updateEventIfPastDate" should "update event status to COMPLETED if date is in the past" in:
    val pastEvent = Event(
      _id = "event-past",
      title = Some("Past Event"),
      description = Some("This event is in the past."),
      poster = Some("past.jpg"),
      tags = Some(List(EventTag.EventType.Concert)),
      location = None,
      date = Some(java.time.LocalDateTime.now().minusDays(5)),
      price = Some(10.0),
      status = EventStatus.PUBLISHED,
      instant = java.time.Instant.now(),
      creatorId = "creator-past",
      collaboratorIds = None
    )

    val updatedEvent = Utils.updateEventIfPastDate(pastEvent)

    updatedEvent.status shouldBe EventStatus.COMPLETED

  it should "not change event status if date is in the future" in:
    val futureEvent = Event(
      _id = "event-future",
      title = Some("Future Event"),
      description = Some("This event is in the future."),
      poster = Some("future.jpg"),
      tags = Some(List(EventTag.EventType.Concert)),
      location = None,
      date = Some(java.time.LocalDateTime.now().plusDays(10)),
      price = Some(15.0),
      status = EventStatus.PUBLISHED,
      instant = java.time.Instant.now(),
      creatorId = "creator-future",
      collaboratorIds = None
    )
    val updatedEvent = Utils.updateEventIfPastDate(futureEvent)
    updatedEvent.status shouldBe EventStatus.PUBLISHED

  it should "not change event status if already COMPLETED" in:
    val completedEvent = Event(
      _id = "event-completed",
      title = Some("Completed Event"),
      description = Some("This event is already completed."),
      poster = Some("completed.jpg"),
      tags = Some(List(EventTag.EventType.Party)),
      location = None,
      date = Some(java.time.LocalDateTime.now().minusDays(15)),
      price = Some(20.0),
      status = EventStatus.COMPLETED,
      instant = java.time.Instant.now(),
      creatorId = "creator-completed",
      collaboratorIds = None
    )
    val updatedEvent = Utils.updateEventIfPastDate(completedEvent)
    updatedEvent.status shouldBe EventStatus.COMPLETED

  "Utils.parseEventFilters" should "correctly parse valid filter parameters" in:
    val commands = Utils.parseEventFilters(
      limit = Some(2),
      offset = Some(5),
      status = Some("PUBLISHED"),
      title = Some("Music Fest"),
      tags = Some(List("Concert", "Rock")),
      startDate = Some("2025-10-01T00:00:00"),
      endDate = Some("2025-12-31T23:59:59"),
      id_organization = Some("123"),
      city = Some("New York"),
      location_name = Some("Madison Square Garden"),
      priceMin = Some(10.0),
      priceMax = Some(50.0),
      sortBy = Some("date"),
      sortOrder = Some("asc")
    )
    commands.title shouldBe Some("Music Fest")
    commands.tags.getOrElse(List()) should contain allElementsOf List(
      EventTag.EventType.Concert,
      EventTag.MusicStyle.Rock
    )
    commands.status shouldBe Some(EventStatus.PUBLISHED)
    commands.startDate shouldBe Some(java.time.LocalDateTime.parse("2025-10-01T00:00:00"))
    commands.endDate shouldBe Some(java.time.LocalDateTime.parse("2025-12-31T23:59:59"))
    commands.id_organization shouldBe Some("123")
    commands.city shouldBe Some("New York")
    commands.location_name shouldBe Some("Madison Square Garden")
    commands.limit shouldBe Some(2)
    commands.offset shouldBe Some(5)
    commands.priceRange shouldBe Some((10.0, 50.0))
    commands.sortBy shouldBe Some("date")
    commands.sortOrder shouldBe Some("asc")

  it should "handle missing filter parameters" in:
    val commands = Utils.parseEventFilters(
      limit = Some(2),
      offset = Some(5),
      status = None,
      title = Some("Music Fest"),
      tags = Some(List("Concert", "Rock")),
      startDate = None,
      endDate = None,
      id_organization = Some("123"),
      city = None,
      location_name = Some("Madison Square Garden"),
      priceMin = None,
      priceMax = None,
      sortBy = None,
      sortOrder = None
    )
    commands.limit shouldBe Some(2)
    commands.offset shouldBe Some(5)
    commands.title shouldBe Some("Music Fest")
    commands.tags.getOrElse(List()) should contain allElementsOf List(
      EventTag.EventType.Concert,
      EventTag.MusicStyle.Rock
    )
    commands.status shouldBe Some(EventStatus.PUBLISHED)
    commands.startDate shouldBe None
    commands.endDate shouldBe None
    commands.id_organization shouldBe Some("123")
    commands.city shouldBe None
    commands.location_name shouldBe Some("Madison Square Garden")
    commands.priceRange shouldBe None
    commands.sortBy shouldBe Some("date")
    commands.sortOrder shouldBe Some("asc")

  it should "handle all filter parameters missing" in:
    val commands = Utils.parseEventFilters(
      limit = None,
      offset = None,
      status = None,
      title = None,
      tags = None,
      startDate = None,
      endDate = None,
      id_organization = None,
      city = None,
      location_name = None,
      priceMin = None,
      priceMax = None,
      sortBy = None,
      sortOrder = None
    )
    commands.limit shouldBe Some(Utils.DEFAULT_LIMIT)
    commands.offset shouldBe None
    commands.title shouldBe None
    commands.tags shouldBe None
    commands.status shouldBe Some(EventStatus.PUBLISHED)
    commands.startDate shouldBe None
    commands.endDate shouldBe None
    commands.id_organization shouldBe None
    commands.city shouldBe None
    commands.location_name shouldBe None
    commands.priceRange shouldBe None
    commands.sortBy shouldBe Some("date")
    commands.sortOrder shouldBe Some("asc")

  it should "handle null max price with min price provided" in:
    val commands = Utils.parseEventFilters(
      limit = None,
      offset = None,
      status = None,
      title = None,
      tags = None,
      startDate = None,
      endDate = None,
      id_organization = None,
      city = None,
      location_name = None,
      priceMin = Some(20.0),
      priceMax = None,
      sortBy = None,
      sortOrder = None
    )
    commands.priceRange shouldBe Some((20.0, Double.MaxValue))

  it should "handle null min price with max price provided" in:
    val commands = Utils.parseEventFilters(
      limit = None,
      offset = None,
      status = None,
      title = None,
      tags = None,
      startDate = None,
      endDate = None,
      id_organization = None,
      city = None,
      location_name = None,
      priceMin = None,
      priceMax = Some(50.0),
      sortBy = None,
      sortOrder = None
    )
    commands.priceRange shouldBe Some((0.0, 50.0))

  "Utils.createPaginatedResponse" should "create correct paginated response JSON" in:
    val events = List(
      Event(
        _id = "event-1",
        title = Some("Event One"),
        description = Some("First event"),
        poster = Some("event1.jpg"),
        tags = Some(List(EventTag.EventType.Concert)),
        location = None,
        date = Some(java.time.LocalDateTime.now().plusDays(1)),
        price = Some(10.0),
        status = EventStatus.PUBLISHED,
        instant = java.time.Instant.now(),
        creatorId = "creator-1",
        collaboratorIds = None
      ),
      Event(
        _id = "event-2",
        title = Some("Event Two"),
        description = Some("Second event"),
        poster = Some("event2.jpg"),
        tags = Some(List(EventTag.EventType.Party)),
        location = None,
        date = Some(java.time.LocalDateTime.now().plusDays(2)),
        price = Some(15.0),
        status = EventStatus.PUBLISHED,
        instant = java.time.Instant.now(),
        creatorId = "creator-2",
        collaboratorIds = None
      )
    )

    val responseJson = Utils.createPaginatedResponse(events, Some(2), Some(0), hasMore = true)

    responseJson("items").arr.length shouldBe 2
    responseJson("limit").num shouldBe 2
    responseJson("offset").num shouldBe 0
    responseJson("hasMore").bool shouldBe true

  it should "handle empty events list in paginated response" in:
    val events       = List.empty[Event]
    val responseJson = Utils.createPaginatedResponse(events, Some(10), Some(0), hasMore = false)
    responseJson("items").arr.length shouldBe 0
    responseJson("limit").num shouldBe 10
    responseJson("offset").num shouldBe 0
    responseJson("hasMore").bool shouldBe false
