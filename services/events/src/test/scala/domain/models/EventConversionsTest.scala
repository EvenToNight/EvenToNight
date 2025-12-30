package domain.models

import domain.models.Location
import org.bson.Document
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.{Instant, LocalDateTime}
import scala.jdk.CollectionConverters.*

class EventConversionsSpec extends AnyFlatSpec with Matchers:
  import EventConversions.*

  private val sampleInstant = Instant.parse("2024-11-18T10:00:00Z")
  private val sampleDate    = LocalDateTime.of(2024, 12, 25, 0, 0)

  private def createEvent(
      id: String = "event123",
      title: Option[String],
      tags: Option[List[EventTag]],
      collaboratorIds: Option[List[String]] = Some(List("collab789"))
  ): Event = Event(
    _id = id,
    title = title,
    description = Some("Test description"),
    poster = Some("poster.jpg"),
    tags = tags,
    location = Some(Location(
      name = Some("Test Venue"),
      country = Some("Test Country"),
      country_code = Some("TC"),
      state = Some("Test State"),
      province = Some("Test Province"),
      city = Some("Test City"),
      road = Some("Test Road"),
      postcode = Some("12345"),
      house_number = Some("10A"),
      lat = Some(45.0),
      lon = Some(90.0),
      link = Some("http://example.com/location")
    )),
    date = Some(sampleDate),
    price = Some(15.0),
    status = EventStatus.DRAFT,
    instant = sampleInstant,
    creatorId = "creator123",
    collaboratorIds = collaboratorIds
  )

  "Event.toDocument" should "convert Event to Document with all fields present" in:
    val event = createEvent(
      title = Some("Christmas Party"),
      tags = Some(List(EventTag.EventType.Party, EventTag.Special.Christmas))
    )
    val document = event.toDocument

    document.getString("_id") shouldBe "event123"
    document.getString("title") shouldBe "Christmas Party"
    document.getString("description") shouldBe "Test description"
    document.getString("poster") shouldBe "poster.jpg"
    document.getList("tags", classOf[String]).asScala.toList shouldBe List("Party", "Christmas")
    document.getDouble("price") shouldBe 15.0
    document.getString("status") shouldBe "DRAFT"
    document.getString("creatorId") shouldBe "creator123"
    document.getList("collaboratorIds", classOf[String]).asScala.toList shouldBe List("collab789")

    val locationDoc = document.get("location", classOf[Document])
    locationDoc.getString("name") shouldBe "Test Venue"
    locationDoc.getString("country") shouldBe "Test Country"
    locationDoc.getString("country_code") shouldBe "TC"
    locationDoc.getString("road") shouldBe "Test Road"
    locationDoc.getString("postcode") shouldBe "12345"
    locationDoc.getString("house_number") shouldBe "10A"
    locationDoc.getDouble("lat") shouldBe 45.0
    locationDoc.getDouble("lon") shouldBe 90.0
    locationDoc.getString("link") shouldBe "http://example.com/location"

  it should "not include None fields in document" in:
    val event = Event(
      _id = "minimal-event",
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      price = None,
      status = EventStatus.DRAFT,
      instant = sampleInstant,
      creatorId = "creator123",
      collaboratorIds = None
    )
    val document = event.toDocument

    document.getString("_id") shouldBe "minimal-event"
    document.getString("status") shouldBe "DRAFT"
    document.getString("creatorId") shouldBe "creator123"

    document.containsKey("title") shouldBe false
    document.containsKey("description") shouldBe false
    document.containsKey("poster") shouldBe false
    document.containsKey("tags") shouldBe false
    document.containsKey("location") shouldBe false
    document.containsKey("date") shouldBe false
    document.containsKey("price") shouldBe false
    document.containsKey("collaboratorIds") shouldBe false

  "Event.toJson" should "convert Event to JSON with all fields present" in:
    val event = createEvent(
      title = Some("Rock Concert"),
      tags = Some(List(EventTag.EventType.Concert, EventTag.MusicStyle.Rock))
    )
    val json = event.toJson

    json("eventId").str shouldBe "event123"
    json("title").str shouldBe "Rock Concert"
    json("description").str shouldBe "Test description"
    json("poster").str shouldBe "poster.jpg"
    json("tags").arr.map(_.str).toList shouldBe List("Concert", "Rock")
    json("location").obj("name").str shouldBe "Test Venue"
    json("location").obj("country").str shouldBe "Test Country"
    json("location").obj("country_code").str shouldBe "TC"
    json("location").obj("city").str shouldBe "Test City"
    json("location").obj("road").str shouldBe "Test Road"
    json("location").obj("postcode").str shouldBe "12345"
    json("location").obj("lat").num shouldBe 45.0
    json("location").obj("lon").num shouldBe 90.0

    json("date").str shouldBe sampleDate.toString
    json("price").num shouldBe 15.0
    json("status").str shouldBe "DRAFT"
    json("instant").str shouldBe sampleInstant.toString
    json("creatorId").str shouldBe "creator123"
    json("collaboratorIds").arr.map(_.str).toList shouldBe List("collab789")

  it should "not include None fields in JSON" in:
    val event = Event(
      _id = "minimal-event",
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      price = None,
      status = EventStatus.DRAFT,
      instant = sampleInstant,
      creatorId = "creator123",
      collaboratorIds = None
    )
    val json = event.toJson

    json("eventId").str shouldBe "minimal-event"
    json("status").str shouldBe "DRAFT"
    json("creatorId").str shouldBe "creator123"

    json.obj.contains("title") shouldBe false
    json.obj.contains("description") shouldBe false
    json.obj.contains("poster") shouldBe false
    json.obj.contains("tags") shouldBe false
    json.obj.contains("location") shouldBe false
    json.obj.contains("date") shouldBe false
    json.obj.contains("price") shouldBe false
    json.obj.contains("collaboratorIds") shouldBe false

  "EventConversions.fromDocument" should "convert Document to Event with all fields" in:
    val document = new Document()
      .append("_id", "event456")
      .append("title", "Test Event From Doc")
      .append("description", "Document description")
      .append("poster", "doc-poster.jpg")
      .append("tags", List("Concert", "Rock").asJava)
      .append(
        "location",
        new Document()
          .append("name", "Test Venue")
          .append("country", "Test Country")
          .append("country_code", "TC")
          .append("city", "Test City")
          .append("road", "Test Road")
          .append("postcode", "12345")
          .append("house_number", "10A")
          .append("lat", 45.0)
          .append("lon", 90.0)
          .append("link", "http://example.com/location")
      )
      .append("date", sampleDate.toString)
      .append("price", 25.5)
      .append("status", "PUBLISHED")
      .append("instant", sampleInstant.toString)
      .append("creatorId", "doc-creator")
      .append("collaboratorIds", List("doc-collaborator").asJava)

    val event = EventConversions.fromDocument(document)

    event._id shouldBe "event456"
    event.title shouldBe Some("Test Event From Doc")
    event.description shouldBe Some("Document description")
    event.poster shouldBe Some("doc-poster.jpg")
    event.tags shouldBe Some(List(EventTag.EventType.Concert, EventTag.MusicStyle.Rock))

    event.location shouldBe defined
    event.location.get.name shouldBe Some("Test Venue")
    event.location.get.country shouldBe Some("Test Country")
    event.location.get.country_code shouldBe Some("TC")
    event.location.get.city shouldBe Some("Test City")
    event.location.get.road shouldBe Some("Test Road")
    event.location.get.postcode shouldBe Some("12345")
    event.location.get.house_number shouldBe Some("10A")
    event.location.get.lat shouldBe Some(45.0)
    event.location.get.lon shouldBe Some(90.0)
    event.location.get.link shouldBe Some("http://example.com/location")

    event.date shouldBe Some(sampleDate)
    event.price shouldBe Some(25.5)
    event.status shouldBe EventStatus.PUBLISHED
    event.instant shouldBe sampleInstant
    event.creatorId shouldBe "doc-creator"
    event.collaboratorIds shouldBe Some(List("doc-collaborator"))

  it should "handle missing optional fields in Document" in:
    val document = new Document()
      .append("_id", "minimal-event")
      .append("status", "DRAFT")
      .append("instant", sampleInstant.toString)
      .append("creatorId", "creator123")

    val event = EventConversions.fromDocument(document)

    event._id shouldBe "minimal-event"
    event.title shouldBe None
    event.description shouldBe None
    event.poster shouldBe None
    event.tags shouldBe None
    event.location shouldBe None
    event.date shouldBe None
    event.price shouldBe None
    event.status shouldBe EventStatus.DRAFT
    event.instant shouldBe sampleInstant
    event.creatorId shouldBe "creator123"
    event.collaboratorIds shouldBe None

  it should "handle null values in Document" in:
    val document = new Document()
      .append("_id", "event-with-nulls")
      .append("title", null)
      .append("description", null)
      .append("tags", null)
      .append("location", null)
      .append("status", "DRAFT")
      .append("instant", sampleInstant.toString)
      .append("creatorId", "creator123")
      .append("collaboratorIds", null)

    val event = EventConversions.fromDocument(document)

    event._id shouldBe "event-with-nulls"
    event.title shouldBe None
    event.description shouldBe None
    event.tags shouldBe None
    event.location shouldBe None
    event.collaboratorIds shouldBe None

  "EventConversions.localityFromDocument" should "handle null location document" in:
    val event = EventConversions.fromDocument(
      new Document()
        .append("_id", "test")
        .append("location", null)
        .append("status", "DRAFT")
        .append("instant", sampleInstant.toString)
        .append("creatorId", "creator")
    )

    event.location shouldBe None

  it should "handle incomplete location fields" in:
    val incompleteLocationDoc = new Document()
      .append("country", "Italy")
      .append("lat", 45.0)

    val testDoc = new Document()
      .append("_id", "test")
      .append("location", incompleteLocationDoc)
      .append("status", "DRAFT")
      .append("instant", sampleInstant.toString)
      .append("creatorId", "creator")

    val event = EventConversions.fromDocument(testDoc)

    event.location shouldBe defined
    event.location.get.country shouldBe Some("Italy")
    event.location.get.name shouldBe None
    event.location.get.city shouldBe None
    event.location.get.lat shouldBe Some(45.0)
    event.location.get.lon shouldBe None

  "EventConversions" should "handle round-trip conversion Document -> Event -> Document" in:
    val originalDoc = new Document()
      .append("_id", "roundtrip-test")
      .append("title", "Roundtrip Event")
      .append("description", "Testing roundtrip")
      .append("poster", "poster.jpg")
      .append("tags", List("Concert", "Jazz").asJava)
      .append(
        "location",
        new Document()
          .append("country", "Italy")
          .append("city", "Bologna")
          .append("lat", 44.49)
          .append("lon", 11.34)
      )
      .append("date", sampleDate.toString)
      .append("price", 20.0)
      .append("status", "PUBLISHED")
      .append("instant", sampleInstant.toString)
      .append("creatorId", "creator123")
      .append("collaboratorIds", List("collab1", "collab2").asJava)

    val event        = EventConversions.fromDocument(originalDoc)
    val convertedDoc = event.toDocument

    convertedDoc.getString("_id") shouldBe originalDoc.getString("_id")
    convertedDoc.getString("title") shouldBe originalDoc.getString("title")
    convertedDoc.getString("description") shouldBe originalDoc.getString("description")
    convertedDoc.getString("status") shouldBe originalDoc.getString("status")
    convertedDoc.getString("creatorId") shouldBe originalDoc.getString("creatorId")
    convertedDoc.getDouble("price") shouldBe originalDoc.getDouble("price")

  it should "handle round-trip conversion Event -> JSON -> verification" in:
    val event = createEvent(
      title = Some("JSON Test"),
      tags = Some(List(EventTag.EventType.Concert))
    )

    val json = event.toJson

    json("eventId").str shouldBe event._id
    json("title").str shouldBe event.title.get
    json("status").str shouldBe event.status.toString
    json("creatorId").str shouldBe event.creatorId
