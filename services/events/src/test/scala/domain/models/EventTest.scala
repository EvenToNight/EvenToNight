package domain.models

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import java.util.UUID

class EventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private def createEvent(
      title: Option[String] = Some("Test Event"),
      description: Option[String] = Some("Test description"),
      poster: Option[String] = Some("poster.jpg"),
      tags: Option[List[EventTag]] = Some(List(EventTag.EventType.Concert)),
      location: Option[Location] = Some(Location.create(
        country = Some("Test Country"),
        country_code = Some("TC"),
        road = Some("Test Road"),
        postcode = Some("12345"),
        house_number = Some("10A"),
        lat = Some(45.0),
        lon = Some(90.0),
        link = Some("http://example.com/location")
      )),
      date: Option[LocalDateTime] = Some(LocalDateTime.of(2024, 12, 31, 22, 0)),
      price: Option[Double] = Some(15.0),
      status: EventStatus = EventStatus.DRAFT,
      creatorId: String = "creator123",
      id_collaborators: Option[List[String]] = None
  ): Event =
    Event.create(
      title = title,
      description = description,
      poster = poster,
      tags = tags,
      location = location,
      date = date,
      price = price,
      status = status,
      creatorId = creatorId,
      id_collaborators = id_collaborators
    )

  "Event case class" should "store properties correctly" in:
    val event = createEvent()
    event.title shouldBe Some("Test Event")
    event.description shouldBe Some("Test description")
    event.poster shouldBe Some("poster.jpg")
    event.tags shouldBe Some(List(EventTag.EventType.Concert))
    event.price shouldBe Some(15.0)
    event.location.get.country shouldBe Some("Test Country")
    event.location.get.country_code shouldBe Some("TC")
    event.location.get.road shouldBe Some("Test Road")
    event.location.get.postcode shouldBe Some("12345")
    event.location.get.house_number shouldBe Some("10A")
    event.location.get.lat shouldBe Some(45.0)
    event.location.get.lon shouldBe Some(90.0)
    event.location.get.link shouldBe Some("http://example.com/location")
    event.id_collaborators shouldBe None
    event.status shouldBe EventStatus.DRAFT

  "Event.createDraft" should "create draft with generated ID and current time" in:
    val event = createEvent()
    event.status shouldBe EventStatus.DRAFT
    event.price shouldBe Some(15.0)
    event.location.get.country shouldBe Some("Test Country")
    event.location.get.postcode shouldBe Some("12345")
    event._id should not be empty
    UUID.fromString(event._id) shouldBe a[UUID]
    event.instant should not be null

  it should "generate unique IDs for different events" in:
    val event1 = createEvent()
    val event2 = createEvent()

    event1._id should not equal event2._id

  "Event.nil" should "create a nil event with default values" in:
    val nilEvent = Event.nil()

    nilEvent._id shouldBe ""
    nilEvent.title shouldBe None
    nilEvent.description shouldBe None
    nilEvent.poster shouldBe None
    nilEvent.tags shouldBe None
    nilEvent.price shouldBe None
    nilEvent.location shouldBe None
    nilEvent.date shouldBe None
    nilEvent.status shouldBe EventStatus.DRAFT
    nilEvent.creatorId shouldBe ""
    nilEvent.id_collaborators shouldBe None

  "Event with multiple tags" should "handle them" in:
    val event = createEvent(tags =
      Some(List(
        EventTag.EventType.Concert,
        EventTag.Venue.Theatre,
        EventTag.MusicStyle.Rock,
        EventTag.Extra.ReservationsRequired
      ))
    )

    event.tags.get should have size 4
    event.tags.get should contain(EventTag.EventType.Concert)
    event.tags.get should contain(EventTag.Venue.Theatre)
    event.tags.get should contain(EventTag.MusicStyle.Rock)
    event.tags.get should contain(EventTag.Extra.ReservationsRequired)

  "Event with different EventStatus" should "handle PUBLISHED status" in:
    val event = createEvent().copy(status = EventStatus.PUBLISHED)
    event.status shouldBe EventStatus.PUBLISHED

  it should "handle CANCELLED status" in:
    val event = createEvent().copy(status = EventStatus.CANCELLED)
    event.status shouldBe EventStatus.CANCELLED

  it should "handle COMPLETED status" in:
    val event = createEvent().copy(status = EventStatus.COMPLETED)
    event.status shouldBe EventStatus.COMPLETED

  "Event with collaborators" should "store collaborator IDs correctly" in:
    val event = createEvent(
      creatorId = "creator-main",
      id_collaborators = Some(List("collaborator-123"))
    )
    event.id_collaborators shouldBe Some(List("collaborator-123"))
    event.creatorId shouldBe "creator-main"

  it should "handle None collaborator" in:
    val event = createEvent(
      id_collaborators = None
    )
    event.id_collaborators shouldBe None

  "Event equality" should "be equal when all fields are the same" in:
    val event1 = createEvent()
    val event2 = event1.copy()

    event1 shouldEqual event2
    event1.hashCode shouldEqual event2.hashCode

  it should "be different when fields differ" in:
    val event1 = createEvent()
    val event2 = event1.copy(title = Some("Different Title"))

    event1 should not equal event2

  it should "be different when _id differs" in:
    val event1 = createEvent()
    val event2 = event1.copy(_id = "different-id")

    event1 should not equal event2

  "Event" should "handle empty tag list" in:
    val event = createEvent(
      tags = None
    )

    event.tags shouldBe None

  it should "handle past dates" in:
    val pastDate = LocalDateTime.of(2020, 1, 1, 10, 0)
    val event = createEvent(
      date = Some(pastDate)
    )
    event.date shouldBe Some(pastDate)
    event.date.get.isBefore(LocalDateTime.now()) shouldBe true

  it should "handle future dates far ahead" in:
    val futureDate = LocalDateTime.of(2050, 12, 31, 23, 59)
    val event = createEvent(
      date = Some(futureDate)
    )

    event.date shouldBe Some(futureDate)
    event.date.get.isAfter(LocalDateTime.now()) shouldBe true
