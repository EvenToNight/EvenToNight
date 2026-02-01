package service
import domain.commands.{GetAllEventsCommand, GetEventCommand, GetFilteredEventsCommand, UpdateEventPosterCommand}
import domain.models.{Event, EventStatus, EventTag, Location}
import infrastructure.db.{EventRepository, MongoEventRepository}
import infrastructure.messaging.MockEventPublisher
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import scala.compiletime.uninitialized

class EventQueryServiceTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  var repo: EventRepository      = uninitialized
  var service: EventQueryService = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    repo = new MongoEventRepository(
      "mongodb://localhost:27017",
      "eventonight_test",
      messageBroker = new MockEventPublisher()
    )
    service = new EventQueryService(repo)

  private def createEvent(): Event =
    Event.create(
      title = Some("Sample Event"),
      description = Some("This is a sample event."),
      poster = Some("sample_poster.png"),
      tags = Some(List(EventTag.EventType.Concert)),
      location = Some(Location.create(
        country = Some("Test Country"),
        country_code = Some("TC"),
        road = Some("Test Road"),
        postcode = Some("12345"),
        house_number = Some("10A"),
        lat = Some(45.0),
        lon = Some(90.0),
        link = Some("http://example.com/location")
      )),
      date = Some(LocalDateTime.now().plusDays(1)),
      status = EventStatus.PUBLISHED,
      creatorId = "creator123",
      collaboratorIds = None
    )

  private def validGetEventCommand(eventId: String): GetEventCommand =
    GetEventCommand(eventId)

  private def validGetAllEventsCommand(): GetAllEventsCommand =
    GetAllEventsCommand()

  private def validUpdateEventPosterCommand(
      eventId: String,
      posterUrl: String
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(eventId, posterUrl)

  "EventQueryService" should "be instantiated correctly" in:
    service.`should`(be(a[EventQueryService]))

  "execCommand(getEventCommand)" should "retrieve an existing event by ID" in:
    val event = createEvent()
    repo.save(event)

    val cmd    = validGetEventCommand(event._id)
    val result = service.execCommand(cmd)

    result match
      case Right(retrievedEvent) =>
        retrievedEvent._id shouldEqual event._id
        retrievedEvent.title shouldEqual event.title
      case Left(error) =>
        fail(s"Expected to retrieve event, but got error: $error")

  it should "return an error when retrieving a non-existing event" in:
    val cmd    = validGetEventCommand("nonexistent_id")
    val result = service.execCommand(cmd)
    result shouldBe Left("Event with id nonexistent_id not found")

  "execCommand(getAllEventsCommand)" should "retrieve all published events" in:
    val event1 = createEvent().copy(status = EventStatus.PUBLISHED)
    val event2 = createEvent()
    val event3 = createEvent().copy(status = EventStatus.PUBLISHED)

    repo.save(event1)
    repo.save(event2)
    repo.save(event3)

    val cmd    = validGetAllEventsCommand()
    val result = service.execCommand(cmd)
    result match
      case Right(events) =>
        events should contain allElementsOf List(event1, event3)
      case Left(error) =>
        fail(s"Expected to retrieve published events, but got error: $error")

  "execCommand(updateEventPosterCommand)" should "update event poster successfully for existing event" in:
    val event = createEvent()
    repo.save(event)
    val updateCmd    = validUpdateEventPosterCommand(eventId = event._id, posterUrl = "new-poster.jpg")
    val updateResult = service.execCommand(updateCmd)
    updateResult.isRight shouldBe true

  it should "fail to update event poster for non-existing event" in:
    val updateCmd    = validUpdateEventPosterCommand(eventId = "nonexistent-id", posterUrl = "new-poster.jpg")
    val updateResult = service.execCommand(updateCmd)
    updateResult.isLeft shouldBe true
    updateResult match
      case Left(error) => error shouldBe "Event nonexistent-id not found"
      case Right(_)    => fail("Update should have failed for non-existing event")

  "execCommand(getFilteredEventsCommand)" should "retrieve events based on filters" in:
    val event1 = createEvent().copy(title = Some("Rock Concert"), tags = Some(List(EventTag.EventType.Concert)))
    val event2 = createEvent().copy(title = Some("Disco"), tags = Some(List(EventTag.EventType.Party)))
    val event3 = createEvent().copy(title = Some("Jazz Night"), tags = Some(List(EventTag.EventType.Concert)))

    repo.save(event1)
    repo.save(event2)
    repo.save(event3)

    val cmd = GetFilteredEventsCommand(
      limit = Some(10),
      offset = Some(0),
      status = Some(List(EventStatus.PUBLISHED)),
      title = None,
      tags = Some(List(EventTag.EventType.Concert)),
      startDate = None,
      endDate = None,
      organizationId = None,
      city = None,
      location_name = None,
      sortBy = None,
      sortOrder = None,
      query = None,
      near = None
    )

    val result = service.execCommand(cmd)
    result match
      case Right((events, _)) =>
        events should contain allElementsOf List(event1, event3)
        events should not contain event2
      case Left(error) =>
        fail(s"Expected to retrieve filtered events, but got error: $error")
