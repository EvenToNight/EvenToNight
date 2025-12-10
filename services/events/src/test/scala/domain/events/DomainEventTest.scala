package domain.events

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.Instant
import scala.compiletime.uninitialized

class DomainEventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var eventCreated: EventCreated     = uninitialized
  var eventPublished: EventPublished = uninitialized
  var eventUpdated: EventUpdated     = uninitialized
  var eventDeleted: EventDeleted     = uninitialized
  val domainid_event: String         = "domainid_event"
  val timestamp: Instant             = Instant.now()
  val id_event: String               = "id_event"

  override def beforeEach(): Unit =
    super.beforeEach()
    eventCreated = EventCreated(
      id = domainid_event,
      timestamp = timestamp,
      id_event = id_event
    )
    eventPublished = EventPublished(
      id = "published-1",
      timestamp = Instant.now(),
      id_event = "event-published-1"
    )
    eventUpdated = EventUpdated(
      id = "updated-1",
      timestamp = Instant.now(),
      id_event = "event-updated-1"
    )
    eventDeleted = EventDeleted(
      id = "deleted-1",
      timestamp = Instant.now(),
      id_event = "event-deleted-1"
    )

  "EventDraftCreated" should "implement DomainEvent trait correctly" in:
    eventCreated shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventCreated.id shouldBe domainid_event
    eventCreated.timestamp shouldBe timestamp
    eventCreated.id_event shouldBe id_event

  it should "be comparable with itself" in:
    val event2 = EventCreated(
      id = domainid_event,
      timestamp = timestamp,
      id_event = id_event
    )

    eventCreated shouldBe event2

  it should "not be equal with different properties" in:
    val event2 = EventCreated(
      id = "id-2",
      timestamp = Instant.now(),
      id_event = "event-2"
    )

    eventCreated should not be event2

  it should "support pattern matching as DomainEvent" in:
    val event: DomainEvent = EventCreated(
      id = "pattern-test",
      timestamp = Instant.now(),
      id_event = "event-pattern"
    )

    val result = event match
      case EventCreated(id, timestamp, id_event) => s"Draft created: $id_event"
      case _                                     => "Unknown event"

    result shouldBe "Draft created: event-pattern"

  it should "have correct timestamp precision" in:
    val beforeCreation = Instant.now()

    val event1 = EventCreated(
      id = "timestamp-test",
      timestamp = Instant.now(),
      id_event = "event-timestamp"
    )

    val afterCreation = Instant.now()

    event1.timestamp.isAfter(beforeCreation.minusSeconds(1)) shouldBe true
    event1.timestamp.isBefore(afterCreation.plusSeconds(1)) shouldBe true

  "DomainEvent trait" should "be implemented by EventCreated" in:
    eventCreated.id should not be empty
    eventCreated.timestamp should not be null

  "EventPublished" should "implement DomainEvent trait correctly" in:
    eventPublished shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventPublished.id shouldBe "published-1"
    eventPublished.id_event shouldBe "event-published-1"
    eventPublished.timestamp shouldBe a[Instant]

  it should "be comparable with itself" in:
    val event2 = EventPublished(
      id = "published-1",
      timestamp = eventPublished.timestamp,
      id_event = "event-published-1"
    )
    eventPublished shouldBe event2

  "EventUpdated" should "implement DomainEvent trait correctly" in:
    eventUpdated shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventUpdated.id shouldBe "updated-1"
    eventUpdated.id_event shouldBe "event-updated-1"
    eventUpdated.timestamp shouldBe a[Instant]

  it should "be comparable with itself" in:
    val event2 = EventUpdated(
      id = "updated-1",
      timestamp = eventUpdated.timestamp,
      id_event = "event-updated-1"
    )
    eventUpdated shouldBe event2

  "EventDeleted" should "implement DomainEvent trait correctly" in:
    eventDeleted shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    eventDeleted.id shouldBe "deleted-1"
    eventDeleted.id_event shouldBe "event-deleted-1"
    eventDeleted.timestamp shouldBe a[Instant]

  it should "be comparable with itself" in:
    val event2 = EventDeleted(
      id = "deleted-1",
      timestamp = eventDeleted.timestamp,
      id_event = "event-deleted-1"
    )
    eventDeleted shouldBe event2
