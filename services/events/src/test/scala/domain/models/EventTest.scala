package domain.models

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import java.util.UUID

class EventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private def createEvent(
      title: String = "Test Event",
      description: String = "Test description",
      poster: String = "poster.jpg",
      tag: List[EventTag] = List(EventTag.TypeOfEvent.Concert),
      location: Location = Location.create(
        country = "Test Country",
        country_code = "TC",
        road = "Test Road",
        postcode = "12345",
        house_number = "10A",
        lat = 45.0,
        lon = 90.0,
        link = "http://example.com/location"
      ),
      date: LocalDateTime = LocalDateTime.of(2024, 12, 31, 22, 0),
      price: Double = 15.0,
      status: EventStatus = EventStatus.DRAFT,
      id_creator: String = "creator123",
      id_collaborator: Option[String] = None
  ): Event =
    Event.create(
      title = title,
      description = description,
      poster = poster,
      tag = tag,
      location = location,
      date = date,
      price = price,
      status = status,
      id_creator = id_creator,
      id_collaborator = id_collaborator
    )

  "Event case class" should "store properties correctly" in:
    val event = createEvent()
    event.title shouldBe "Test Event"
    event.description shouldBe "Test description"
    event.poster shouldBe "poster.jpg"
    event.tag shouldBe List(EventTag.TypeOfEvent.Concert)
    event.price shouldBe 15.0
    event.location.country shouldBe "Test Country"
    event.location.country_code shouldBe "TC"
    event.location.road shouldBe "Test Road"
    event.location.postcode shouldBe "12345"
    event.location.house_number shouldBe "10A"
    event.location.lat shouldBe 45.0
    event.location.lon shouldBe 90.0
    event.location.link shouldBe "http://example.com/location"
    event.id_collaborator shouldBe None
    event.status shouldBe EventStatus.DRAFT

  "Event.createDraft" should "create draft with generated ID and current time" in:
    val event = createEvent()
    event.status shouldBe EventStatus.DRAFT
    event.price shouldBe 15.0
    event.location.country shouldBe "Test Country"
    event.location.postcode shouldBe "12345"
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
    nilEvent.title shouldBe ""
    nilEvent.description shouldBe ""
    nilEvent.poster shouldBe ""
    nilEvent.tag shouldBe empty
    nilEvent.price shouldBe 0.0
    nilEvent.location shouldBe Location.Nil()
    nilEvent.date shouldBe LocalDateTime.MAX
    nilEvent.status shouldBe EventStatus.DRAFT
    nilEvent.id_creator shouldBe ""
    nilEvent.id_collaborator shouldBe None

  "Event with multiple tags" should "handle them" in:
    val event = createEvent(tag =
      List(
        EventTag.TypeOfEvent.Concert,
        EventTag.VenueType.Theatre,
        EventTag.MusicGenre.Rock,
        EventTag.Target.Vip,
        EventTag.Extra.ReservationRequired
      )
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
    val event = createEvent(
      id_creator = "creator-main",
      id_collaborator = Some("collaborator-123")
    )
    event.id_collaborator shouldBe Some("collaborator-123")
    event.id_creator shouldBe "creator-main"

  it should "handle None collaborator" in:
    val event = createEvent(
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
    val event = createEvent(
      tag = List()
    )

    event.tag shouldBe empty

  it should "handle very long strings" in:
    val longTitle       = "A" * 1000
    val longDescription = "B" * 5000
    val event = createEvent(
      title = longTitle,
      description = longDescription
    )

    event.title should have length 1000
    event.description should have length 5000

  it should "handle past dates" in:
    val pastDate = LocalDateTime.of(2020, 1, 1, 10, 0)
    val event = createEvent(
      date = pastDate
    )
    event.date shouldBe pastDate
    event.date.isBefore(LocalDateTime.now()) shouldBe true

  it should "handle future dates far ahead" in:
    val futureDate = LocalDateTime.of(2050, 12, 31, 23, 59)
    val event = createEvent(
      date = futureDate
    )

    event.date shouldBe futureDate
    event.date.isAfter(LocalDateTime.now()) shouldBe true

  "Event.nil() edge cases" should "be consistent across multiple calls" in:
    val nil1 = Event.nil()
    val nil2 = Event.nil()

    nil1 shouldEqual nil2
    nil1.hashCode shouldEqual nil2.hashCode

  it should "have empty instant" in:
    val nilEvent = Event.nil()
    nilEvent.instant should not be null

  it should "be different from any created event" in:
    val nilEvent     = Event.nil()
    val createdEvent = createEvent()

    nilEvent should not equal createdEvent
    nilEvent._id should not equal createdEvent._id
    nilEvent.title should not equal createdEvent.title

  "Event.createDraft edge cases" should "handle zero price" in:
    val event = createEvent(price = 0.0)
    event.price shouldBe 0.0

  it should "handle negative price" in:
    val event = createEvent(price = -10.0)
    event.price shouldBe -10.0

  it should "handle very high price" in:
    val event = createEvent(price = 999999.99)
    event.price shouldBe 999999.99

  it should "handle empty strings for required fields" in:
    val event = createEvent(
      title = "",
      description = "",
      poster = "",
      id_creator = ""
    )

    event.title shouldBe ""
    event.description shouldBe ""
    event.poster shouldBe ""
    event.id_creator shouldBe ""
    event.status shouldBe EventStatus.DRAFT

  it should "handle special characters in string fields" in:
    val event = createEvent(
      title = "Special Event: Café & Müsik!",
      description = "Event with émojis 🎵 and ñoño characters",
      id_creator = "creator_with-special.chars@domain"
    )

    event.title shouldBe "Special Event: Café & Müsik!"
    event.description shouldBe "Event with émojis 🎵 and ñoño characters"
    event.id_creator shouldBe "creator_with-special.chars@domain"

  it should "handle extreme date values" in:
    val minDate = LocalDateTime.MIN
    val maxDate = LocalDateTime.MAX

    val eventMin = createEvent(date = minDate)
    val eventMax = createEvent(date = maxDate)

    eventMin.date shouldBe minDate
    eventMax.date shouldBe maxDate

  "Event copy method" should "copy with single field changes" in:
    val original = createEvent()

    val copiedTitle = original.copy(title = "New Title")
    copiedTitle.title shouldBe "New Title"
    copiedTitle._id shouldBe original._id
    copiedTitle.description shouldBe original.description

    val copiedStatus = original.copy(status = EventStatus.PUBLISHED)
    copiedStatus.status shouldBe EventStatus.PUBLISHED
    copiedStatus.title shouldBe original.title

  it should "copy with multiple field changes" in:
    val original = createEvent()

    val multiCopy = original.copy(
      title = "Updated Event",
      price = 25.0,
      status = EventStatus.PUBLISHED,
      id_collaborator = Some("new-collaborator")
    )

    multiCopy.title shouldBe "Updated Event"
    multiCopy.price shouldBe 25.0
    multiCopy.status shouldBe EventStatus.PUBLISHED
    multiCopy.id_collaborator shouldBe Some("new-collaborator")
    multiCopy._id shouldBe original._id
    multiCopy.description shouldBe original.description
    multiCopy.location shouldBe original.location

  it should "copy location field" in:
    val original = createEvent()
    val newLocation = Location.create(
      country = "New Country",
      country_code = "NC",
      road = "New Road",
      postcode = "54321",
      house_number = "20",
      lat = 50.0,
      lon = 100.0,
      link = "http://newlocation.com"
    )

    val copiedLocation = original.copy(location = newLocation)
    copiedLocation.location shouldBe newLocation
    copiedLocation.location.country shouldBe "New Country"
    copiedLocation.title shouldBe original.title

  "Event toString method" should "contain event information" in:
    val event       = createEvent()
    val eventString = event.toString

    eventString should include("Test Event")
    eventString should include("Event")

  it should "handle nil event toString" in:
    val nilEvent  = Event.nil()
    val nilString = nilEvent.toString

    nilString should include("Event")

  "Event productArity and productElement" should "return correct arity" in:
    val event = createEvent()
    event.productArity should be > 0

  it should "access product elements without error" in:
    val event = createEvent()
    val arity = event.productArity

    for i <- 0 until arity do
      noException should be thrownBy event.productElement(i)

  "Event equals contract" should "be reflexive" in:
    val event = createEvent()
    event shouldEqual event

  it should "be symmetric" in:
    val event1 = createEvent()
    val event2 = event1.copy()

    (event1 == event2) shouldBe (event2 == event1)

  it should "be transitive" in:
    val event1 = createEvent()
    val event2 = event1.copy()
    val event3 = event1.copy()

    event1 shouldEqual event2
    event2 shouldEqual event3
    event1 shouldEqual event3

  it should "handle comparison with different types" in:
    val event = createEvent()

    event should not equal "not an event"
    event should not equal 123
    event should not equal null
    event should not equal Location.Nil()

  "Event hashCode consistency" should "be consistent across multiple calls" in:
    val event = createEvent()
    val hash1 = event.hashCode
    val hash2 = event.hashCode

    hash1 shouldEqual hash2

  it should "have equal hash codes for equal objects" in:
    val event1 = createEvent()
    val event2 = event1.copy()

    if event1 == event2 then
      event1.hashCode shouldEqual event2.hashCode
