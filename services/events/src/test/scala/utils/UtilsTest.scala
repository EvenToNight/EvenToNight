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

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithoutPath, "http://media-service")

    result shouldBe "/events/test-event-123/default.jpg"

  it should "return default URL when file cannot be read" in:
    val id_event            = "test-event-456"
    val nonExistentPath     = Paths.get("/non/existent/file.jpg")
    val formFileWithBadPath = FormFile("test.jpg", Some(nonExistentPath), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithBadPath, "http://media-service")

    result shouldBe "/events/test-event-456/default.jpg"

  it should "return default URL when media service request fails" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-789"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val invalidMediaServiceUrl = "http://non-existent-service:9999"

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithValidPath, invalidMediaServiceUrl)

    result shouldBe "/events/test-event-789/default.jpg"

  it should "handle successful upload simulation" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-success"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithValidPath, "http://localhost:8080")

    result shouldBe "/events/test-event-success/default.jpg"

  it should "handle malformed media service response" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-malformed"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithValidPath, "http://httpbin.org/status/500")

    result shouldBe "/events/test-event-malformed/default.jpg"

  it should "generate correct default URL format" in:
    val id_event            = "special-event-#123"
    val formFileWithoutPath = FormFile("test.jpg", None, new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithoutPath, "http://media-service")

    result shouldBe "/events/special-event-#123/default.jpg"

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
      "id_collaborator": "collab-001"
    }"""

    val command = Utils.getCreateCommandFromJson(validJson)

    command.title shouldBe "Sample Event"
    command.description shouldBe "This is a sample event."
    command.tag should contain allElementsOf List(EventTag.VenueType.Bar, EventTag.MusicGenre.Indie)
    command.location.country shouldBe "USA"
    command.date shouldBe java.time.LocalDateTime.parse("2025-11-15T19:30:00")
    command.price shouldBe 20.0
    command.status shouldBe domain.models.EventStatus.DRAFT
    command.id_creator shouldBe "creator-001"
    command.id_collaborator shouldBe Some("collab-001")

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
    command.tag should contain(EventTag.TypeOfEvent.Concert)
    command.location.country shouldBe "UK"
    command.date shouldBe java.time.LocalDateTime.parse("2025-12-01T" + "10:00:00")
    command.price shouldBe 0.0
    command.status shouldBe domain.models.EventStatus.PUBLISHED
    command.id_creator shouldBe "creator-002"
    command.id_collaborator shouldBe None

  it should "handle invalid JSON and return default CreateEventCommand" in:
    val invalidJson = "{ invalid json structure"
    val command     = Utils.getCreateCommandFromJson(invalidJson)
    command.title shouldBe ""
    command.description shouldBe ""
    command.tag shouldBe List()
    command.location shouldBe Location.Nil()
    command.date shouldBe java.time.LocalDateTime.MIN
    command.price shouldBe 0.0
    command.status shouldBe domain.models.EventStatus.DRAFT
    command.id_creator shouldBe ""
    command.id_collaborator shouldBe None

  it should "handle non-JSON string and return default CreateEventCommand" in:
    val notJson = "this is not json at all"
    val command = Utils.getCreateCommandFromJson(notJson)
    command.title shouldBe ""
    command.description shouldBe ""
    command.tag shouldBe List()
    command.location shouldBe Location.Nil()
    command.date shouldBe java.time.LocalDateTime.MIN
    command.price shouldBe 0.0
    command.status shouldBe domain.models.EventStatus.DRAFT
    command.id_creator shouldBe ""
    command.id_collaborator shouldBe None
  it should "handle empty string and return default CreateEventCommand" in:
    val command = Utils.getCreateCommandFromJson("")
    command.title shouldBe ""
    command.description shouldBe ""
    command.tag shouldBe List()
    command.location shouldBe Location.Nil()
    command.date shouldBe java.time.LocalDateTime.MIN
    command.price shouldBe 0.0
    command.status shouldBe domain.models.EventStatus.DRAFT
    command.id_creator shouldBe ""
    command.id_collaborator shouldBe None

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
      "id_collaborator": "collab-002"
    }"""

    val command = Utils.getUpdateCommandFromJson("event-123", validJson)

    command.id_event shouldBe "event-123"
    command.title shouldBe Some("Updated Event Title")
    command.description shouldBe Some("Updated description.")
    command.tag.getOrElse(List()) should contain allElementsOf List(EventTag.VenueType.Club, EventTag.MusicGenre.Rock)
    command.location.map(_.country) shouldBe Some("Canada")
    command.date shouldBe Some(java.time.LocalDateTime.parse("2026-01-20T18:00:00"))
    command.price shouldBe Some(30.0)
    command.status shouldBe Some(domain.models.EventStatus.CANCELLED)
    command.id_collaborator shouldBe Some("collab-002")

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
    command.tag.getOrElse(List()) should contain(EventTag.TypeOfEvent.Concert)
    command.location shouldBe None
    command.date shouldBe Some(java.time.LocalDateTime.parse("2026-02-10" + "T12:00:00"))
    command.price shouldBe None
    command.status shouldBe None
    command.id_collaborator shouldBe None

  it should "handle invalid JSON and return UpdateEventCommand with None fields" in:
    val invalidJson = "{ invalid json structure"
    val command     = Utils.getUpdateCommandFromJson("event-789", invalidJson)
    command.id_event shouldBe "event-789"
    command.title shouldBe None
    command.description shouldBe None
    command.tag shouldBe None
    command.location shouldBe None
    command.date shouldBe None
    command.price shouldBe None
    command.status shouldBe None
    command.id_collaborator shouldBe None

  it should "handle non-JSON string and return UpdateEventCommand with None fields" in:
    val notJson = "this is not json at all"
    val command = Utils.getUpdateCommandFromJson("event-101", notJson)
    command.id_event shouldBe "event-101"
    command.title shouldBe None
    command.description shouldBe None
    command.tag shouldBe None
    command.location shouldBe None
    command.date shouldBe None
    command.price shouldBe None
    command.status shouldBe None
    command.id_collaborator shouldBe None

  it should "handle empty string and return UpdateEventCommand with None fields" in:
    val command = Utils.getUpdateCommandFromJson("event-202", "")
    command.id_event shouldBe "event-202"
    command.title shouldBe None
    command.description shouldBe None
    command.tag shouldBe None
    command.location shouldBe None
    command.date shouldBe None
    command.price shouldBe None
    command.status shouldBe None
    command.id_collaborator shouldBe None

  "Utils.updateEventIfPastDate" should "update event status to COMPLETED if date is in the past" in:
    val pastEvent = Event(
      _id = "event-past",
      title = "Past Event",
      description = "This event is in the past.",
      poster = "past.jpg",
      tag = List(EventTag.TypeOfEvent.Concert),
      location = Location.Nil(),
      date = java.time.LocalDateTime.now().minusDays(5),
      price = 10.0,
      status = EventStatus.PUBLISHED,
      instant = java.time.Instant.now(),
      id_creator = "creator-past",
      id_collaborator = None
    )

    val updatedEvent = Utils.updateEventIfPastDate(pastEvent)

    updatedEvent.status shouldBe EventStatus.COMPLETED

  it should "not change event status if date is in the future" in:
    val futureEvent = Event(
      _id = "event-future",
      title = "Future Event",
      description = "This event is in the future.",
      poster = "future.jpg",
      tag = List(EventTag.TypeOfEvent.Concert),
      location = Location.Nil(),
      date = java.time.LocalDateTime.now().plusDays(10),
      price = 15.0,
      status = EventStatus.PUBLISHED,
      instant = java.time.Instant.now(),
      id_creator = "creator-future",
      id_collaborator = None
    )
    val updatedEvent = Utils.updateEventIfPastDate(futureEvent)
    updatedEvent.status shouldBe EventStatus.PUBLISHED

  it should "not change event status if already COMPLETED" in:
    val completedEvent = Event(
      _id = "event-completed",
      title = "Completed Event",
      description = "This event is already completed.",
      poster = "completed.jpg",
      tag = List(EventTag.TypeOfEvent.Party),
      location = Location.Nil(),
      date = java.time.LocalDateTime.now().minusDays(15),
      price = 20.0,
      status = EventStatus.COMPLETED,
      instant = java.time.Instant.now(),
      id_creator = "creator-completed",
      id_collaborator = None
    )
    val updatedEvent = Utils.updateEventIfPastDate(completedEvent)
    updatedEvent.status shouldBe EventStatus.COMPLETED
