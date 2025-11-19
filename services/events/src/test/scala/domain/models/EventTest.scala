package domain.models

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.util.UUID

class EventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private def createEvent(
      title: String = "Test Event",
      tag: List[EventTag],
      id_collaborator: Option[String] = Some("collaborator-123")
  ): Event =
    Event(
      _id = "test-id",
      title = title,
      description = "Test description",
      poster = "poster.jpg",
      tag = tag,
      location = "Test Location",
      date = java.time.LocalDateTime.of(2025, 12, 31, 23, 0),
      status = EventStatus.DRAFT,
      instant = java.time.Instant.now(),
      id_creator = "creator-123",
      id_collaborator = id_collaborator
    )

  "Event case class" should "store properties correctly" in:
    val event = createEvent("Custom Title", tag = List(EventTag.TypeOfEvent.Concert), None)

    event.title shouldBe "Custom Title"
    event.tag shouldBe List(EventTag.TypeOfEvent.Concert)
    event.id_collaborator shouldBe None
    event.status shouldBe EventStatus.DRAFT

  it should "handle different tag combinations" in:
    val emptyEvent = createEvent(tag = List.empty)
    val multiEvent = createEvent(tag =
      List(
        EventTag.TypeOfEvent.Concert,
        EventTag.VenueType.Theatre,
        EventTag.MusicGenre.Jazz
      )
    )

    emptyEvent.tag shouldBe empty
    multiEvent.tag should have length 3

  "Event.createDraft" should "create draft with generated ID and current time" in:
    val event = Event.createDraft(
      title = "Draft Event",
      description = "Test draft",
      poster = "poster.jpg",
      tag = List(EventTag.TypeOfEvent.Party),
      location = "Location",
      date = java.time.LocalDateTime.of(2025, 12, 31, 23, 0),
      id_creator = "creator-123",
      id_collaborator = None
    )

    event.status shouldBe EventStatus.DRAFT
    event._id should not be empty
    UUID.fromString(event._id) shouldBe a[UUID]
    event.instant should not be null

  it should "generate unique IDs for different events" in:
    val event1 = Event.createDraft(
      "Event 1",
      "desc",
      "poster",
      List(EventTag.TypeOfEvent.Party),
      "loc",
      java.time.LocalDateTime.of(2025, 12, 31, 23, 0),
      "creator",
      None
    )
    val event2 = Event.createDraft(
      "Event 2",
      "desc",
      "poster",
      List(EventTag.TypeOfEvent.Party),
      "loc",
      java.time.LocalDateTime.of(2025, 12, 31, 23, 0),
      "creator",
      None
    )

    event1._id should not equal event2._id
