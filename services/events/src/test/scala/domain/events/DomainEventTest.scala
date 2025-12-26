package domain.events

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.Instant
import scala.compiletime.uninitialized

class DomainEventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var eventPublished: EventPublished = uninitialized
  var eventUpdated: EventUpdated     = uninitialized
  var eventDeleted: EventDeleted     = uninitialized
  val domaineventId: String          = "domaineventId"
  val timestamp: Instant             = Instant.now()
  val eventId: String                = "eventId"

  override def beforeEach(): Unit =
    super.beforeEach()
    eventPublished = EventPublished(
      timestamp = Instant.now(),
      eventId = "event-published-1",
      creatorId = "creator-1",
      collaboratorIds = Some(List("collab-1", "collab-2"))
    )
    eventUpdated = EventUpdated(
      timestamp = Instant.now(),
      eventId = "event-updated-1"
    )
    eventDeleted = EventDeleted(
      timestamp = Instant.now(),
      eventId = "event-deleted-1"
    )

  "EventPublished" should "implement DomainEvent trait correctly" in:
    eventPublished shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventPublished.eventId shouldBe "event-published-1"
    eventPublished.timestamp shouldBe a[Instant]

  it should "be comparable with itself" in:
    val event2 = EventPublished(
      timestamp = eventPublished.timestamp,
      eventId = "event-published-1",
      creatorId = "creator-1",
      collaboratorIds = Some(List("collab-1", "collab-2"))
    )
    eventPublished shouldBe event2

  "EventUpdated" should "implement DomainEvent trait correctly" in:
    eventUpdated shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventUpdated.eventId shouldBe "event-updated-1"
    eventUpdated.timestamp shouldBe a[Instant]

  it should "be comparable with itself" in:
    val event2 = EventUpdated(
      timestamp = eventUpdated.timestamp,
      eventId = "event-updated-1"
    )
    eventUpdated shouldBe event2

  "EventDeleted" should "implement DomainEvent trait correctly" in:
    eventDeleted shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventDeleted.eventId shouldBe "event-deleted-1"
    eventDeleted.timestamp shouldBe a[Instant]

  it should "be comparable with itself" in:
    val event2 = EventDeleted(
      timestamp = eventDeleted.timestamp,
      eventId = "event-deleted-1"
    )
    eventDeleted shouldBe event2
