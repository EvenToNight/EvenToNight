package service
import domain.commands.{GetAllEventsCommand, GetEventCommand, GetFilteredEventsCommand, UpdateEventPosterCommand}
import domain.models.{Event, EventStatus, EventTag, Location}
import infrastructure.db.{EventRepository, MongoEventRepository}
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
    repo = new MongoEventRepository("mongodb://localhost:27017", "eventonight_test")
    service = new EventQueryService(repo)

  private def createEvent(): Event =
    Event.create(
      title = "Sample Event",
      description = "This is a sample event.",
      poster = "sample_poster.png",
      tags = List(EventTag.TypeOfEvent.Concert),
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
      price = 15.0,
      date = LocalDateTime.now().plusDays(1),
      status = EventStatus.PUBLISHED,
      id_creator = "creator123",
      id_collaborators = None
    )

  private def validGetEventCommand(id_event: String): GetEventCommand =
    GetEventCommand(id_event)

  private def validGetAllEventsCommand(): GetAllEventsCommand =
    GetAllEventsCommand()

  private def validUpdateEventPosterCommand(
      id_event: String,
      posterUrl: String
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(id_event, posterUrl)

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
    val updateCmd    = validUpdateEventPosterCommand(id_event = event._id, posterUrl = "new-poster.jpg")
    val updateResult = service.execCommand(updateCmd)
    updateResult.isRight shouldBe true

  it should "fail to update event poster for non-existing event" in:
    val updateCmd    = validUpdateEventPosterCommand(id_event = "nonexistent-id", posterUrl = "new-poster.jpg")
    val updateResult = service.execCommand(updateCmd)
    updateResult.isLeft shouldBe true
    updateResult match
      case Left(error) => error shouldBe "Event nonexistent-id not found"
      case Right(_)    => fail("Update should have failed for non-existing event")

  "execCommand(getFilteredEventsCommand)" should "retrieve events based on filters" in:
    val event1 = createEvent().copy(title = "Rock Concert", tags = List(EventTag.TypeOfEvent.Concert))
    val event2 = createEvent().copy(title = "Disco", tags = List(EventTag.TypeOfEvent.Party))
    val event3 = createEvent().copy(title = "Jazz Night", tags = List(EventTag.TypeOfEvent.Concert))

    repo.save(event1)
    repo.save(event2)
    repo.save(event3)

    val cmd = GetFilteredEventsCommand(
      limit = Some(10),
      offset = Some(0),
      status = Some(EventStatus.PUBLISHED),
      title = None,
      tags = Some(List(EventTag.TypeOfEvent.Concert)),
      startDate = None,
      endDate = None,
      id_organization = None,
      city = None,
      location_name = None
    )

    val result = service.execCommand(cmd)
    result match
      case Right((events, _)) =>
        events should contain allElementsOf List(event1, event3)
        events should not contain event2
      case Left(error) =>
        fail(s"Expected to retrieve filtered events, but got error: $error")
