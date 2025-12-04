package domain.events

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.Instant
import scala.compiletime.uninitialized

class DomainEventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var createEvent: EventCreated    = uninitialized
  var publishEvent: EventPublished = uninitialized
  val domainid_event: String       = "domainid_event"
  val timestamp: Instant           = Instant.now()
  val id_event: String             = "id_event"

  override def beforeEach(): Unit =
    super.beforeEach()
    createEvent = EventCreated(
      id = domainid_event,
      timestamp = timestamp,
      id_event = id_event
    )
    publishEvent = EventPublished(
      id = "published-1",
      timestamp = Instant.now(),
      id_event = "event-published-1"
    )

  "EventDraftCreated" should "implement DomainEvent trait correctly" in:
    createEvent shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    createEvent.id shouldBe domainid_event
    createEvent.timestamp shouldBe timestamp
    createEvent.id_event shouldBe id_event

  it should "be comparable with itself" in:
    val event2 = EventCreated(
      id = domainid_event,
      timestamp = timestamp,
      id_event = id_event
    )

    createEvent shouldBe event2

  it should "not be equal with different properties" in:
    val event2 = EventCreated(
      id = "id-2",
      timestamp = Instant.now(),
      id_event = "event-2"
    )

    createEvent should not be event2

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
    createEvent.id should not be empty
    createEvent.timestamp should not be null

  "EventPublished" should "implement DomainEvent trait correctly" in:
    publishEvent shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    publishEvent.id shouldBe "published-1"
    publishEvent.id_event shouldBe "event-published-1"
    publishEvent.timestamp shouldBe a[Instant]

  it should "be comparable with itself" in:
    val event2 = EventPublished(
      id = "published-1",
      timestamp = publishEvent.timestamp,
      id_event = "event-published-1"
    )
    publishEvent shouldBe event2
