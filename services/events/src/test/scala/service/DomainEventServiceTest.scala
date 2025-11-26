package service

import domain.commands.CreateEventDraftCommand
import domain.commands.UpdateEventPosterCommand
import domain.models.EventTag
import infrastructure.db.EventRepository
import infrastructure.db.MongoEventRepository
import infrastructure.messaging.EventPublisher
import infrastructure.messaging.MockEventPublisher
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import scala.compiletime.uninitialized

class DomainEventServiceTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  var repo: EventRepository       = uninitialized
  var publisher: EventPublisher   = uninitialized
  var service: DomainEventService = uninitialized
  override def beforeEach(): Unit =
    super.beforeEach()
    repo = new MongoEventRepository("mongodb://localhost:27017", "eventonight_test")
    publisher = new MockEventPublisher()
    service = new DomainEventService(repo, publisher)

  private def validCreateEventDraftCommand(
      title: String = "Test Event",
      description: String = "Test Description",
      poster: String = "test-poster.jpg",
      tag: List[EventTag] = List(EventTag.VenueType.Bar),
      location: String = "Test Location",
      date: LocalDateTime = LocalDateTime.of(2025, 12, 31, 20, 0),
      id_creator: String = "creator-123",
      id_collaborator: Option[String] = None
  ): CreateEventDraftCommand =
    CreateEventDraftCommand(title, description, poster, tag, location, date, id_creator, id_collaborator)

  private def validUpdateEventPosterCommand(
      eventId: String,
      posterUrl: String
  ): UpdateEventPosterCommand =
    UpdateEventPosterCommand(eventId, posterUrl)

  "DomainEventService" should "be instantiated correctly" in:
    service.`should`(be(a[DomainEventService]))

  it should "create an event draft successfully" in:
    val cmd    = validCreateEventDraftCommand()
    val result = service.createEventDraft(cmd)
    result.isRight shouldBe true

  it should "update event poster successfully for existing event" in:
    val createCmd    = validCreateEventDraftCommand()
    val createResult = service.createEventDraft(createCmd)
    createResult.isRight shouldBe true
    val eventId = createResult match
      case Right(id) => id
      case Left(_)   => fail("Failed to create event draft for update test")
    val updateCmd    = validUpdateEventPosterCommand(eventId = eventId, posterUrl = "new-poster.jpg")
    val updateResult = service.updatePoster(updateCmd)
    updateResult.isRight shouldBe true

  it should "fail to update event poster for non-existing event" in:
    val updateCmd    = validUpdateEventPosterCommand(eventId = "nonexistent-id", posterUrl = "new-poster.jpg")
    val updateResult = service.updatePoster(updateCmd)
    updateResult.isLeft shouldBe true
    updateResult match
      case Left(error) => error shouldBe "Event nonexistent-id not found"
      case Right(_)    => fail("Update should have failed for non-existing event")
