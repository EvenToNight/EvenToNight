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
      title: String = "Test Event",
      tags: List[EventTag] = List(EventTag.TypeOfEvent.Party),
      id_collaborator: Option[String] = Some("collab789")
  ): Event = Event(
    _id = id,
    title = title,
    description = "Test description",
    poster = "poster.jpg",
    tags = tags,
    location = Location.create(
      country = "Test Country",
      country_code = "TC",
      road = "Test Road",
      postcode = "12345",
      house_number = "10A",
      lat = 45.0,
      lon = 90.0,
      link = "http://example.com/location"
    ),
    date = sampleDate,
    price = 15.0,
    status = EventStatus.DRAFT,
    instant = sampleInstant,
    id_creator = "creator123",
    id_collaborator = id_collaborator
  )

  "Event.toDocument" should "convert Event to Document with all fields" in:
    val event = createEvent(
      title = "Christmas Party",
      tags = List(EventTag.TypeOfEvent.Party, EventTag.Theme.Christmas)
    )
    val document = event.toDocument

    document.getString("_id") shouldBe "event123"
    document.getString("title") shouldBe "Christmas Party"
    document.getList("tags", classOf[String]).asScala.toList shouldBe List("Party", "Christmas")
    document.getDouble("price") shouldBe 15.0
    document.getString("id_collaborator") shouldBe "collab789"

    val locationDoc = document.get("location", classOf[Document])
    locationDoc.getString("country") shouldBe "Test Country"
    locationDoc.getString("country_code") shouldBe "TC"
    locationDoc.getString("road") shouldBe "Test Road"
    locationDoc.getString("postcode") shouldBe "12345"
    locationDoc.getString("house_number") shouldBe "10A"
    locationDoc.getDouble("lat") shouldBe 45.0
    locationDoc.getDouble("lon") shouldBe 90.0
    locationDoc.getString("link") shouldBe "http://example.com/location"

  it should "return valid BSON Document" in:
    val event    = createEvent()
    val document = event.toDocument

    document shouldBe a[Document]
    document.keySet() should contain allOf ("_id", "title", "tags", "id_creator")

  "Event.toJson" should "convert Event to JSON with all fields" in:
    val event = createEvent(
      title = "Jazz Concert",
      tags = List(EventTag.TypeOfEvent.Concert, EventTag.MusicGenre.Jazz)
    )
    val json = event.toJson

    json("id_event").str shouldBe "event123"
    json("title").str shouldBe "Jazz Concert"
    json("description").str shouldBe "Test description"
    json("poster").str shouldBe "poster.jpg"
    json("tags").arr.map(_.str).toList shouldBe List("Concert", "Jazz")
    json("location") shouldBe ujson.Obj(
      "name"         -> "",
      "country"      -> "Test Country",
      "country_code" -> "TC",
      "state"        -> "",
      "province"     -> "",
      "city"         -> "",
      "road"         -> "Test Road",
      "postcode"     -> "12345",
      "house_number" -> "10A",
      "lat"          -> 45.0,
      "lon"          -> 90.0,
      "link"         -> "http://example.com/location"
    )
    json("date").str shouldBe sampleDate.toString
    json("price").num shouldBe 15.0
    json("status").str shouldBe "DRAFT"
    json("instant").str shouldBe sampleInstant.toString
    json("id_creator").str shouldBe "creator123"
    json("id_collaborator").str shouldBe "collab789"

  "EventConversions.fromDocument" should "convert Document to Event with all fields" in:
    val document = new Document()
      .append("_id", "event456")
      .append("title", "Test Event From Doc")
      .append("description", "Document description")
      .append("poster", "doc-poster.jpg")
      .append("tags", List("Concert", "Jazz").asJava)
      .append(
        "location",
        new Document()
          .append("country", "Test Country")
          .append("country_code", "TC")
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
      .append("id_creator", "doc-creator")
      .append("id_collaborator", "doc-collaborator")

    val event = EventConversions.fromDocument(document)

    event._id shouldBe "event456"
    event.title shouldBe "Test Event From Doc"
    event.description shouldBe "Document description"
    event.poster shouldBe "doc-poster.jpg"
    event.tags shouldBe List(EventTag.TypeOfEvent.Concert, EventTag.MusicGenre.Jazz)
    event.location shouldBe Location.create(
      country = "Test Country",
      country_code = "TC",
      road = "Test Road",
      postcode = "12345",
      house_number = "10A",
      lat = 45.0,
      lon = 90.0,
      link = "http://example.com/location"
    )
    event.date shouldBe sampleDate
    event.price shouldBe 25.5
    event.status shouldBe EventStatus.PUBLISHED
    event.instant shouldBe sampleInstant
    event.id_creator shouldBe "doc-creator"
    event.id_collaborator shouldBe Some("doc-collaborator")

  "EventConversions.getDoubleValue" should "handle different numeric types" in:
    val testDoc = new Document()
      .append("_id", "test")
      .append("title", "Test")
      .append("description", "Test")
      .append("poster", "test.jpg")
      .append("tags", List("Concert").asJava)
      .append(
        "location",
        new Document().append("lat", 42).append("lon", 42.5).append("country", "Test").append("country_code", "TC")
      )
      .append("date", sampleDate.toString)
      .append("price", 42) // Integer value
      .append("status", "DRAFT")
      .append("instant", sampleInstant.toString)
      .append("id_creator", "creator")

    val event = EventConversions.fromDocument(testDoc)
    event.price shouldBe 42.0
    event.location.lat shouldBe 42.0
    event.location.lon shouldBe 42.5

  "EventConversions.localityFromDocument" should "handle null location document" in:
    val testDoc = new Document()
      .append("_id", "test")
      .append("title", "Test")
      .append("description", "Test")
      .append("poster", "test.jpg")
      .append("tags", List("Concert").asJava)
      .append("location", null)
      .append("date", sampleDate.toString)
      .append("price", 0.0)
      .append("status", "DRAFT")
      .append("instant", sampleInstant.toString)
      .append("id_creator", "creator")

    val event = EventConversions.fromDocument(testDoc)
    event.location shouldBe Location.Nil()

  it should "handle missing location fields" in:
    val incompleteLocationDoc = new Document()
      .append("country", "Italy")
      .append("lat", 45.0)

    val testDoc = new Document()
      .append("_id", "test")
      .append("title", "Test")
      .append("description", "Test")
      .append("poster", "test.jpg")
      .append("tags", List("Concert").asJava)
      .append("location", incompleteLocationDoc)
      .append("date", sampleDate.toString)
      .append("price", 0.0)
      .append("status", "DRAFT")
      .append("instant", sampleInstant.toString)
      .append("id_creator", "creator")

    val event = EventConversions.fromDocument(testDoc)
    event.location.country shouldBe "Italy"
    event.location.name shouldBe ""
    event.location.city shouldBe ""
    event.location.lat shouldBe 45.0
    event.location.lon shouldBe 0.0
