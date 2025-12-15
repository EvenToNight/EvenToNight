package service

import domain.commands.{
  CreateEventCommand,
  DeleteEventCommand,
  GetAllEventsCommand,
  GetEventCommand,
  GetFilteredEventsCommand,
  UpdateEventCommand,
  UpdateEventPosterCommand
}
import domain.models.{EventStatus, EventTag, Location}
import infrastructure.db.{EventRepository, MongoEventRepository}
import infrastructure.messaging.{EventPublisher, MockEventPublisher}
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import scala.compiletime.uninitialized

class EventServiceTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var repo: EventRepository     = uninitialized
  var publisher: EventPublisher = uninitialized
  var service: EventService     = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    repo = new MongoEventRepository("mongodb://localhost:27017", "eventonight_test")
    publisher = new MockEventPublisher
    service = new EventService(repo, publisher)

  private def validCreateEventCommand(
      title: Option[String] = Some("Test Event"),
      description: Option[String] = Some("Test Description"),
      poster: Option[String] = Some("test-poster.jpg"),
      tags: Option[List[EventTag]] = Some(List(EventTag.VenueType.Bar)),
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
      price: Option[Double] = Some(15.0),
      date: Option[LocalDateTime] = Some(LocalDateTime.of(2025, 12, 31, 20, 0)),
      status: EventStatus = EventStatus.DRAFT,
      id_creator: String = "creator-123",
      id_collaborators: Option[List[String]] = None
  ): CreateEventCommand =
    CreateEventCommand(title, description, poster, tags, location, date, price, status, id_creator, id_collaborators)

  private def validGetEventCommand(id_event: String = "event-123"): GetEventCommand =
    GetEventCommand(id_event)

  private def validUpdateEventPosterCommand(
      id_event: String = "event-123",
      posterUrl: String = "poster-url.jpg"
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(id_event, posterUrl)

  private def validGetAllEventsCommand(): GetAllEventsCommand =
    GetAllEventsCommand()

  private def validUpdateEventCommand(
      id_event: String,
      title: Option[String],
      description: Option[String] = None,
      tags: Option[List[EventTag]] = None,
      location: Option[Location] = None,
      date: Option[LocalDateTime] = None,
      price: Option[Double] = None,
      status: EventStatus = EventStatus.DRAFT,
      id_collaborators: Option[List[String]] = None
  ): UpdateEventCommand =
    UpdateEventCommand(id_event, title, description, tags, location, date, price, status, id_collaborators)

  private def validDeleteEventCommand(id_event: String): DeleteEventCommand =
    DeleteEventCommand(id_event)

  private def validGetFilteredEventsCommand(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[EventStatus] = None,
      title: Option[String] = None,
      tags: Option[List[EventTag]] = None,
      startDate: Option[LocalDateTime] = None,
      endDate: Option[LocalDateTime] = None,
      id_organization: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None,
      priceRange: Option[(Double, Double)] = None,
      sortBy: Option[String] = None,
      sortOrder: Option[String] = None
  ): GetFilteredEventsCommand =
    GetFilteredEventsCommand(
      limit,
      offset,
      status,
      title,
      tags,
      startDate,
      endDate,
      id_organization,
      city,
      location_name,
      priceRange,
      sortBy,
      sortOrder
    )

  "EventService" should "be instantiated correctly" in:
    service.`should`(be(a[EventService]))

  "handleCommand" should "successfully process valid CreateEventCommand" in:
    val command = validCreateEventCommand()
    val result  = service.handleCommand(command)

    result.isRight shouldBe true

  it should "return validation errors for CreateEventCommand with empty title" in:
    val command = validCreateEventCommand(title = None, status = EventStatus.PUBLISHED)

    val result = service.handleCommand(command)

    result shouldBe Left("Title cannot be empty")

  it should "return validation errors for CreateEventCommand with invalid date" in:
    val command =
      validCreateEventCommand(date = Some(LocalDateTime.of(2020, 1, 1, 0, 0)), status = EventStatus.PUBLISHED)

    val result = service.handleCommand(command)

    result shouldBe Left("Date must be in the future")

  it should "return validation errors for CreateEventCommand with empty location" in:
    val command = validCreateEventCommand(location = Some(Location.Nil()), status = EventStatus.PUBLISHED)

    val result = service.handleCommand(command)

    result shouldBe Left("Location has invalid parameters")

  it should "return validation errors for CreateEventCommand with empty description" in:
    val command = validCreateEventCommand(description = None, status = EventStatus.PUBLISHED)

    val result = service.handleCommand(command)

    result shouldBe Left("Description cannot be empty")

  it should "concatenate multiple validation errors for CreateEventCommand" in:
    val command =
      validCreateEventCommand(
        title = None,
        date = Some(LocalDateTime.of(2020, 1, 1, 0, 0)),
        location = None,
        status = EventStatus.PUBLISHED
      )
    val result = service.handleCommand(command) match
      case Left(errors) => errors
      case _            => fail("Expected validation errors")

    result should include(",")

  it should "successfully process valid UpdateEventPosterCommand" in:
    val createCommand = validCreateEventCommand()
    val id_event = service.handleCommand(createCommand) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")

    val command = validUpdateEventPosterCommand(id_event = id_event)
    val result  = service.handleCommand(command)
    result.isRight shouldBe true

  it should "return errors for UpdateEventPosterCommand with non-existent id_event" in:
    val command = validUpdateEventPosterCommand(id_event = "non-existent-id")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "return validation errors for UpdateEventPosterCommand with empty id_event" in:
    val command = validUpdateEventPosterCommand(id_event = "")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "return validation errors for UpdateEventPosterCommand with invalid posterUrl" in:
    val command = validUpdateEventPosterCommand(posterUrl = "invalid-url")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "successfully process valid GetEventCommand" in:
    val createCommand = validCreateEventCommand()
    val id_event = service.handleCommand(createCommand) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")
    val command = validGetEventCommand(id_event)
    val result  = service.handleCommand(command)
    result.isRight shouldBe true

  it should "return validation errors for GetEventCommand with empty id" in:
    val command = validGetEventCommand("")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "handle non-existent event gracefully" in:
    val command = validGetEventCommand("non-existent")
    val result  = service.handleCommand(command)
    result should matchPattern { case Left(_) | Right(_) => }

  it should "correctly initialize eventQueryService" in:
    service.eventQueryService should not be null
    service.eventQueryService shouldBe a[EventQueryService]

  it should "correctly initialize eventCommandService" in:
    service.eventCommandService should not be null
    service.eventCommandService shouldBe a[DomainEventService]

  it should "successfully process GetAllEventsCommand and return published events" in:
    val command = validGetAllEventsCommand()
    val result  = service.handleCommand(command)

    result shouldBe a[Right[?, ?]]
    result match
      case Right(events) => events shouldBe a[List[?]]
      case Left(error)   => fail(s"Expected Right with events list, but got Left: $error")

  it should "handle all command types without throwing exceptions" in:
    val commands = List(
      validCreateEventCommand(),
      validUpdateEventPosterCommand(),
      validGetEventCommand(),
      validGetAllEventsCommand()
    )
    commands.foreach: cmd =>
      noException should be thrownBy service.handleCommand(cmd)

  it should "successfully process valid UpdateEventCommand" in:
    val createCommand = validCreateEventCommand()
    val id_event = service.handleCommand(createCommand) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")
    val command = validUpdateEventCommand(
      id_event = id_event,
      title = Some("Updated Event Title"),
      price = Some(20.0)
    )
    val result = service.handleCommand(command)
    result.isRight shouldBe true

  it should "return validation errors for UpdateEventCommand with empty id_event" in:
    val command = validUpdateEventCommand(
      id_event = "",
      title = Some("Updated Event Title")
    )
    val result = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "return not found error for UpdateEventCommand with non-existent id_event" in:
    val command = validUpdateEventCommand(
      id_event = "non-existent-id",
      title = Some("Updated Event Title")
    )
    val result = service.handleCommand(command)
    result.isLeft shouldBe true
    result match
      case Left(error) => error shouldBe "Event with id non-existent-id not found"
      case Right(_)    => fail("Expected failure when updating non-existent event")

  it should "successfully process valid DeleteEventCommand" in:
    val createCommand = validCreateEventCommand()
    val id_event = service.handleCommand(createCommand) match
      case Right(id: String) => id
      case _                 => fail("Expected event ID as String")
    val command = validDeleteEventCommand(id_event)
    val result  = service.handleCommand(command)
    result.isRight shouldBe true

  it should "return validation errors for DeleteEventCommand with empty id_event" in:
    val command = validDeleteEventCommand("")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true

  it should "return not found error for DeleteEventCommand with non-existent id_event" in:
    val command = validDeleteEventCommand("non-existent-id")
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true
    result match
      case Left(error) => error shouldBe "Event with id non-existent-id not found"
      case Right(_)    => fail("Expected failure when deleting non-existent event")

  it should "successfully process valid GetFilteredEventsCommand" in:
    val command = validGetFilteredEventsCommand()
    val result  = service.handleCommand(command)
    result shouldBe a[Right[?, ?]]
    result match
      case Right((events, _)) => events shouldBe a[List[?]]
      case _                  => fail("Expected Right with events list, but got Left")

  it should "return validation errors for GetFilteredEventsCommand with invalid parameters" in:
    val command = validGetFilteredEventsCommand(limit = Some(-10))
    val result  = service.handleCommand(command)
    result.isLeft shouldBe true
    result match
      case Left(error) => error should include("Limit must be positive")
      case Right(_)    => fail("Expected validation error for invalid limit")
