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

  it should "handle None collaborator as null" in:
    val event    = createEvent(id_collaborator = None)
    val document = event.toDocument

    document.get("id_collaborator") shouldBe null

  it should "handle empty tag list" in:
    val event    = createEvent(tag = List.empty)
    val document = event.toDocument

    document.getList("tag", classOf[String]).asScala.toList shouldBe empty

  it should "return valid BSON Document" in:
    val event    = createEvent()
    val document = event.toDocument

    document shouldBe a[Document]
    document.keySet() should contain allOf ("_id", "title", "tag", "id_creator")
