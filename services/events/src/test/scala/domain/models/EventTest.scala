package domain.models

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import java.util.UUID

class EventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private def createEvent(): Event =
    Event(
      _id = "test-id",
      title = "Test Event",
      description = "Test description",
      poster = "poster.jpg",
      tag = List(EventTag.TypeOfEvent.Concert),
      location = "Test Location",
      date = java.time.LocalDateTime.of(2025, 12, 31, 23, 0),
      status = EventStatus.DRAFT,
      instant = java.time.Instant.now(),
      id_creator = "creator-123",
      id_collaborator = None
    )

  "Event case class" should "store properties correctly" in:
    val event = createEvent()

    event.title shouldBe "Test Event"
    event.description shouldBe "Test description"
    event.poster shouldBe "poster.jpg"
    event.tag shouldBe List(EventTag.TypeOfEvent.Concert)
    event.id_collaborator shouldBe None
    event.status shouldBe EventStatus.DRAFT

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

  "Event.nil" should "create a nil event with default values" in:
    val nilEvent = Event.nil()

    nilEvent._id shouldBe ""
    nilEvent.title shouldBe ""
    nilEvent.description shouldBe ""
    nilEvent.poster shouldBe ""
    nilEvent.tag shouldBe empty
    nilEvent.location shouldBe ""
    nilEvent.date shouldBe LocalDateTime.MAX
    nilEvent.status shouldBe EventStatus.DRAFT
    nilEvent.id_creator shouldBe ""
    nilEvent.id_collaborator shouldBe None

  "Event with multiple tags" should "handle them" in:
    val event = Event.createDraft(
      title = "VIP Concert",
      description = "Exclusive concert",
      poster = "vip.jpg",
      tag = List(
        EventTag.TypeOfEvent.Concert,
        EventTag.VenueType.Theatre,
        EventTag.MusicGenre.Rock,
        EventTag.Target.Vip,
        EventTag.Extra.ReservationRequired
      ),
      location = "Opera House",
      date = LocalDateTime.of(2025, 8, 20, 20, 0),
      id_creator = "creator-vip",
      id_collaborator = Some("collab-vip")
    )

    event.tag should have size 5
    event.tag should contain(EventTag.TypeOfEvent.Concert)
    event.tag should contain(EventTag.VenueType.Theatre)
    event.tag should contain(EventTag.MusicGenre.Rock)
    event.tag should contain(EventTag.Target.Vip)
    event.tag should contain(EventTag.Extra.ReservationRequired)

  "Event with different EventStatus" should "handle PUBLISHED status" in:
    val event = createEvent().copy(status = EventStatus.PUBLISHED)
    event.status shouldBe EventStatus.PUBLISHED

  it should "handle CANCELLED status" in:
    val event = createEvent().copy(status = EventStatus.CANCELLED)
    event.status shouldBe EventStatus.CANCELLED

  it should "handle COMPLETED status" in:
    val event = createEvent().copy(status = EventStatus.COMPLETED)
    event.status shouldBe EventStatus.COMPLETED

  "Event with collaborator" should "store collaborator ID correctly" in:
    val event = Event.createDraft(
      title = "Collaborative Event",
      description = "Event with collaborator",
      poster = "collab.jpg",
      tag = List(EventTag.TypeOfEvent.Party),
      location = "Shared Venue",
      date = LocalDateTime.of(2025, 7, 4, 19, 0),
      id_creator = "creator-main",
      id_collaborator = Some("collaborator-123")
    )

    event.id_collaborator shouldBe Some("collaborator-123")
    event.id_creator shouldBe "creator-main"

  it should "handle None collaborator" in:
    val event = Event.createDraft(
      title = "Solo Event",
      description = "Event without collaborator",
      poster = "solo.jpg",
      tag = List(EventTag.TypeOfEvent.DJSet),
      location = "Solo Venue",
      date = LocalDateTime.of(2025, 5, 10, 22, 0),
      id_creator = "creator-solo",
      id_collaborator = None
    )

    event.id_collaborator shouldBe None

  "Event equality" should "be equal when all fields are the same" in:
    val event1 = createEvent()
    val event2 = event1.copy()

    event1 shouldEqual event2
    event1.hashCode shouldEqual event2.hashCode

  it should "be different when fields differ" in:
    val event1 = createEvent()
    val event2 = event1.copy(title = "Different Title")

    event1 should not equal event2

  it should "be different when _id differs" in:
    val event1 = createEvent()
    val event2 = event1.copy(_id = "different-id")

    event1 should not equal event2

  "Event" should "handle empty tag list" in:
    val event = Event.createDraft(
      title = "No Tags Event",
      description = "Event without tags",
      poster = "notags.jpg",
      tag = List(),
      location = "Basic Location",
      date = LocalDateTime.of(2025, 3, 15, 15, 0),
      id_creator = "creator-empty",
      id_collaborator = None
    )

    event.tag shouldBe empty

  it should "handle very long strings" in:
    val longTitle       = "A" * 1000
    val longDescription = "B" * 5000
    val event = Event.createDraft(
      title = longTitle,
      description = longDescription,
      poster = "long.jpg",
      tag = List(EventTag.TypeOfEvent.Concert),
      location = "Long Location",
      date = LocalDateTime.of(2025, 1, 1, 12, 0),
      id_creator = "creator-long",
      id_collaborator = None
    )

    event.title should have length 1000
    event.description should have length 5000

  it should "handle past dates" in:
    val pastDate = LocalDateTime.of(2020, 1, 1, 10, 0)
    val event = Event.createDraft(
      title = "Past Event",
      description = "Event in the past",
      poster = "past.jpg",
      tag = List(EventTag.TypeOfEvent.Concert),
      location = "Time Machine",
      date = pastDate,
      id_creator = "creator-past",
      id_collaborator = None
    )

    event.date shouldBe pastDate
    event.date.isBefore(LocalDateTime.now()) shouldBe true

  it should "handle future dates far ahead" in:
    val futureDate = LocalDateTime.of(2050, 12, 31, 23, 59)
    val event = Event.createDraft(
      title = "Future Event",
      description = "Event far in the future",
      poster = "future.jpg",
      tag = List(EventTag.TypeOfEvent.NewOpening),
      location = "Space Station",
      date = futureDate,
      id_creator = "creator-future",
      id_collaborator = None
    )

    event.date shouldBe futureDate
    event.date.isAfter(LocalDateTime.now()) shouldBe true
