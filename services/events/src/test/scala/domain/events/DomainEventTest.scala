package domain.events

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.compiletime.uninitialized

class DomainEventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var eventPublished: EventPublished = uninitialized
  var eventUpdated: EventUpdated     = uninitialized
  var eventDeleted: EventDeleted     = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    eventPublished = EventPublished(
      eventId = "event-published-1",
      creatorId = "creator-1",
      collaboratorIds = Some(List("collab-1", "collab-2"))
    )
    eventUpdated = EventUpdated(
      eventId = "event-updated-1",
      collaboratorIds = None
    )
    eventDeleted = EventDeleted(
      eventId = "event-deleted-1"
    )

  "EventPublished" should "implement DomainEvent trait correctly" in:
    eventPublished shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventPublished.eventId shouldBe "event-published-1"
    eventPublished.creatorId shouldBe "creator-1"
    eventPublished.collaboratorIds shouldBe Some(List("collab-1", "collab-2"))

  it should "be comparable with itself" in:
    val event2 = EventPublished(
      eventId = "event-published-1",
      creatorId = "creator-1",
      collaboratorIds = Some(List("collab-1", "collab-2"))
    )
    eventPublished shouldBe event2

  "EventUpdated" should "implement DomainEvent trait correctly" in:
    eventUpdated shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventUpdated.eventId shouldBe "event-updated-1"
    eventUpdated.collaboratorIds shouldBe None

  it should "be comparable with itself" in:
    val event2 = EventUpdated(
      eventId = "event-updated-1",
      collaboratorIds = None
    )
    eventUpdated shouldBe event2

  "EventDeleted" should "implement DomainEvent trait correctly" in:
    eventDeleted shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventDeleted.eventId shouldBe "event-deleted-1"

  it should "be comparable with itself" in:
    val event2 = EventDeleted(
      eventId = "event-deleted-1"
    )
    eventDeleted shouldBe event2
