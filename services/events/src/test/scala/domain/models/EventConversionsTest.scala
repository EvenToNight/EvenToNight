package domain.models

import org.bson.Document
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.Instant
import java.time.LocalDateTime
import scala.jdk.CollectionConverters.*

class EventConversionsSpec extends AnyFlatSpec with Matchers:
  import EventConversions.*

  private val sampleInstant = Instant.parse("2024-11-18T10:00:00Z")
  private val sampleDate    = LocalDateTime.of(2024, 12, 25, 0, 0)

  private def createEvent(
      id: String = "event123",
      title: String = "Test Event",
      tag: List[EventTag] = List(EventTag.TypeOfEvent.Party),
      id_collaborator: Option[String] = Some("collab789")
  ): Event = Event(
    _id = id,
    title = title,
    description = "Test description",
    poster = "poster.jpg",
    tag = tag,
    location = "Test Location",
    date = sampleDate,
    status = EventStatus.DRAFT,
    instant = sampleInstant,
    id_creator = "creator123",
    id_collaborator = id_collaborator
  )

  "Event.toDocument" should "convert Event to Document with all fields" in:
    val event = createEvent(
      title = "Christmas Party",
      tag = List(EventTag.TypeOfEvent.Party, EventTag.Theme.Christmas)
    )
    val document = event.toDocument

    document.getString("_id") shouldBe "event123"
    document.getString("title") shouldBe "Christmas Party"
    document.getList("tag", classOf[String]).asScala.toList shouldBe List("Party", "Christmas")
    document.getString("id_collaborator") shouldBe "collab789"

  it should "return valid BSON Document" in:
    val event    = createEvent()
    val document = event.toDocument

    document shouldBe a[Document]
    document.keySet() should contain allOf ("_id", "title", "tag", "id_creator")

  "Event.toJson" should "convert Event to JSON with all fields" in:
    val event = createEvent(
      title = "Jazz Concert",
      tag = List(EventTag.TypeOfEvent.Concert, EventTag.MusicGenre.Jazz)
    )
    val json = event.toJson

    json("id_event").str shouldBe "event123"
    json("title").str shouldBe "Jazz Concert"
    json("description").str shouldBe "Test description"
    json("poster").str shouldBe "poster.jpg"
    json("tag").arr.map(_.str).toList shouldBe List("Concert", "Jazz")
    json("location").str shouldBe "Test Location"
    json("date").str shouldBe sampleDate.toString
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
      .append("tag", List("Concert", "Jazz").asJava)
      .append("location", "Document Location")
      .append("date", sampleDate.toString)
      .append("status", "PUBLISHED")
      .append("instant", sampleInstant.toString)
      .append("id_creator", "doc-creator")
      .append("id_collaborator", "doc-collaborator")

    val event = EventConversions.fromDocument(document)

    event._id shouldBe "event456"
    event.title shouldBe "Test Event From Doc"
    event.description shouldBe "Document description"
    event.poster shouldBe "doc-poster.jpg"
    event.tag shouldBe List(EventTag.TypeOfEvent.Concert, EventTag.MusicGenre.Jazz)
    event.location shouldBe "Document Location"
    event.date shouldBe sampleDate
    event.status shouldBe EventStatus.PUBLISHED
    event.instant shouldBe sampleInstant
    event.id_creator shouldBe "doc-creator"
    event.id_collaborator shouldBe Some("doc-collaborator")
