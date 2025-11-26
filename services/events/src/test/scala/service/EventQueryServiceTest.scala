package service
import domain.commands.GetEventCommand
import domain.models.Event
import domain.models.EventTag
import infrastructure.db.EventRepository
import infrastructure.db.MongoEventRepository
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

  private def validGetEventCommand(id_event: String): GetEventCommand =
    GetEventCommand(id_event)

  "EventQueryService" should "be instantiated correctly" in:
    service.`should`(be(a[EventQueryService]))

  it should "retrieve an existing event by ID" in:
    val event = Event.createDraft(
      title = "Sample Event",
      description = "This is a sample event.",
      poster = "sample_poster.png",
      tag = List(EventTag.TypeOfEvent.Concert),
      location = "Sample Location",
      date = LocalDateTime.now().plusDays(1),
      id_creator = "creator123",
      id_collaborator = None
    )
    repo.save(event)

    val cmd    = validGetEventCommand(event._id)
    val result = service.getEvent(cmd)

    result match
      case Right(retrievedEvent) =>
        retrievedEvent._id shouldEqual event._id
        retrievedEvent.title shouldEqual event.title
      case Left(error) =>
        fail(s"Expected to retrieve event, but got error: $error")

  it should "return an error when retrieving a non-existing event" in:
    val cmd    = validGetEventCommand("nonexistent_id")
    val result = service.getEvent(cmd)
    result shouldBe Left("Event with id nonexistent_id not found")
