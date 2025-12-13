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

    location.name shouldBe "La Scala"
    location.country shouldBe "Italy"
    location.country_code shouldBe "IT"
    location.state shouldBe "Lombardy"
    location.province shouldBe "Milan"
    location.city shouldBe "Milano"
    location.road shouldBe "Via della Scala"
    location.postcode shouldBe "20121"
    location.house_number shouldBe "3"
    location.lat shouldBe 45.4654
    location.lon shouldBe 9.1859
    location.link shouldBe "https://www.teatroallascala.org"

  it should "parse JSON with missing fields using defaults" in:
    val partialJson = """{
      "country": "Spain",
      "lat": 40.4168,
      "lon": -3.7038
    }"""

    val location = Utils.parseLocationFromJson(partialJson)

    location.country shouldBe "Spain"
    location.lat shouldBe 40.4168
    location.lon shouldBe -3.7038
    location.name shouldBe ""
    location.city shouldBe ""
    location.postcode shouldBe ""

  it should "handle empty JSON object" in:
    val emptyJson = "{}"

    val location = Utils.parseLocationFromJson(emptyJson)

    location.name shouldBe ""
    location.country shouldBe ""
    location.lat shouldBe 0.0
    location.lon shouldBe 0.0

  it should "handle invalid JSON and return Location.Nil()" in:
    val invalidJson = "{ invalid json structure"

    val location = Utils.parseLocationFromJson(invalidJson)

    location shouldBe Location.Nil()

  it should "handle non-JSON string and return Location.Nil()" in:
    val notJson = "this is not json at all"

    val location = Utils.parseLocationFromJson(notJson)

    location shouldBe Location.Nil()

  it should "handle empty string and return Location.Nil()" in:
    val location = Utils.parseLocationFromJson("")

    location shouldBe Location.Nil()

  "Utils.uploadPosterToMediaService" should "return default URL when FormFile has no filePath" in:
    val id_event            = "test-event-123"
    val formFileWithoutPath = FormFile("test.jpg", None, new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, Some(formFileWithoutPath), "http://media-service")

    result shouldBe "events/default.jpg"

  it should "return default URL when file cannot be read" in:
    val id_event            = "test-event-456"
    val nonExistentPath     = Paths.get("/non/existent/file.jpg")
    val formFileWithBadPath = FormFile("test.jpg", Some(nonExistentPath), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, Some(formFileWithBadPath), "http://media-service")

    result shouldBe "events/default.jpg"

  it should "return default URL when media service request fails" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-789"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val invalidMediaServiceUrl = "http://non-existent-service:9999"

    val result = Utils.uploadPosterToMediaService(id_event, Some(formFileWithValidPath), invalidMediaServiceUrl)

    result shouldBe "events/default.jpg"

  it should "handle successful upload simulation" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-success"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, Some(formFileWithValidPath), "http://localhost:8080")

    result shouldBe "events/default.jpg"

  it should "handle malformed media service response" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-malformed"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val result =
      Utils.uploadPosterToMediaService(id_event, Some(formFileWithValidPath), "http://httpbin.org/status/500")

    result shouldBe "events/default.jpg"

  it should "generate correct default URL format" in:
    val id_event            = "special-event-#123"
    val formFileWithoutPath = FormFile("test.jpg", None, new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, Some(formFileWithoutPath), "http://media-service")

    result shouldBe "events/default.jpg"

  "Utils.getCreateCommandFromJson" should "parse valid JSON into CreateEventCommand" in:
    val validJson = """{
      "title": "Sample Event",
      "description": "This is a sample event.",
      "tags": ["Bar", "Indie"],
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
      "id_creator": "creator-001",
      "id_collaborators": ["collab-001"]
    }"""

    val command = Utils.getCreateCommandFromJson(validJson)

    command.title shouldBe "Sample Event"
    command.description shouldBe "This is a sample event."
    command.tags should contain allElementsOf List(EventTag.VenueType.Bar, EventTag.MusicGenre.Indie)
    command.location.country shouldBe "USA"
    command.date shouldBe java.time.LocalDateTime.parse("2025-11-15T19:30:00")
    command.price shouldBe 20.0
    command.status shouldBe domain.models.EventStatus.DRAFT
    command.id_creator shouldBe "creator-001"
    command.id_collaborators shouldBe Some(List("collab-001"))

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
      "id_creator": "creator-002"
    }"""
    val command     = Utils.getCreateCommandFromJson(partialJson)
    command.title shouldBe "Partial Event"
    command.description shouldBe "This event has missing optional fields."
    command.tags should contain(EventTag.TypeOfEvent.Concert)
    command.location.country shouldBe "UK"
    command.date shouldBe java.time.LocalDateTime.parse("2025-12-01T" + "10:00:00")
    command.price shouldBe 0.0
    command.status shouldBe domain.models.EventStatus.PUBLISHED
    command.id_creator shouldBe "creator-002"
    command.id_collaborators shouldBe None

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
      "id_collaborators": ["collab-002"]
    }"""

    val command = Utils.getUpdateCommandFromJson("event-123", validJson)

    command.id_event shouldBe "event-123"
    command.title shouldBe Some("Updated Event Title")
    command.description shouldBe Some("Updated description.")
    command.tags.getOrElse(List()) should contain allElementsOf List(EventTag.VenueType.Club, EventTag.MusicGenre.Rock)
    command.location.map(_.country) shouldBe Some("Canada")
    command.date shouldBe Some(java.time.LocalDateTime.parse("2026-01-20T18:00:00"))
    command.price shouldBe Some(30.0)
    command.status shouldBe Some(domain.models.EventStatus.CANCELLED)
    command.id_collaborators shouldBe Some(List("collab-002"))

  it should "handle JSON with missing optional fields" in:
    val partialJson = """{
      "title": "Partially Updated Title",
      "tags": ["Concert"],
      "date": "2026-02-10T12:00:00"
    }"""
    val command     = Utils.getUpdateCommandFromJson("event-456", partialJson)
    command.id_event shouldBe "event-456"
    command.title shouldBe Some("Partially Updated Title")
    command.description shouldBe None
    command.tags.getOrElse(List()) should contain(EventTag.TypeOfEvent.Concert)
    command.location shouldBe None
    command.date shouldBe Some(java.time.LocalDateTime.parse("2026-02-10" + "T12:00:00"))
    command.price shouldBe None
    command.status shouldBe None
    command.id_collaborators shouldBe None

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
      title = "Past Event",
      description = "This event is in the past.",
      poster = "past.jpg",
      tags = List(EventTag.TypeOfEvent.Concert),
      location = Location.Nil(),
      date = java.time.LocalDateTime.now().minusDays(5),
      price = 10.0,
      status = EventStatus.PUBLISHED,
      instant = java.time.Instant.now(),
      id_creator = "creator-past",
      id_collaborators = None
    )

    val updatedEvent = Utils.updateEventIfPastDate(pastEvent)

    updatedEvent.status shouldBe EventStatus.COMPLETED

  it should "not change event status if date is in the future" in:
    val futureEvent = Event(
      _id = "event-future",
      title = "Future Event",
      description = "This event is in the future.",
      poster = "future.jpg",
      tags = List(EventTag.TypeOfEvent.Concert),
      location = Location.Nil(),
      date = java.time.LocalDateTime.now().plusDays(10),
      price = 15.0,
      status = EventStatus.PUBLISHED,
      instant = java.time.Instant.now(),
      id_creator = "creator-future",
      id_collaborators = None
    )
    val updatedEvent = Utils.updateEventIfPastDate(futureEvent)
    updatedEvent.status shouldBe EventStatus.PUBLISHED

  it should "not change event status if already COMPLETED" in:
    val completedEvent = Event(
      _id = "event-completed",
      title = "Completed Event",
      description = "This event is already completed.",
      poster = "completed.jpg",
      tags = List(EventTag.TypeOfEvent.Party),
      location = Location.Nil(),
      date = java.time.LocalDateTime.now().minusDays(15),
      price = 20.0,
      status = EventStatus.COMPLETED,
      instant = java.time.Instant.now(),
      id_creator = "creator-completed",
      id_collaborators = None
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
      location_name = Some("Madison Square Garden")
    )
    commands.title shouldBe Some("Music Fest")
    commands.tags.getOrElse(List()) should contain allElementsOf List(
      EventTag.TypeOfEvent.Concert,
      EventTag.MusicGenre.Rock
    )
    commands.status shouldBe Some(EventStatus.PUBLISHED)
    commands.startDate shouldBe Some(java.time.LocalDateTime.parse("2025-10-01T00:00:00"))
    commands.endDate shouldBe Some(java.time.LocalDateTime.parse("2025-12-31T23:59:59"))
    commands.id_organization shouldBe Some("123")
    commands.city shouldBe Some("New York")
    commands.location_name shouldBe Some("Madison Square Garden")

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
      location_name = Some("Madison Square Garden")
    )
    commands.limit shouldBe Some(2)
    commands.offset shouldBe Some(5)
    commands.title shouldBe Some("Music Fest")
    commands.tags.getOrElse(List()) should contain allElementsOf List(
      EventTag.TypeOfEvent.Concert,
      EventTag.MusicGenre.Rock
    )
    commands.status shouldBe None
    commands.startDate shouldBe None
    commands.endDate shouldBe None
    commands.id_organization shouldBe Some("123")
    commands.city shouldBe None
    commands.location_name shouldBe Some("Madison Square Garden")

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
      location_name = None
    )
    commands.limit shouldBe Some(Utils.DEFAULT_LIMIT)
    commands.offset shouldBe None
    commands.title shouldBe None
    commands.tags shouldBe None
    commands.status shouldBe None
    commands.startDate shouldBe None
    commands.endDate shouldBe None
    commands.id_organization shouldBe None
    commands.city shouldBe None
    commands.location_name shouldBe None
