package domain.events

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.Instant
import scala.compiletime.uninitialized

class DomainEventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var createEvent: EventDraftCreated = uninitialized
  val domainid_event: String         = "domainid_event"
  val timestamp: Instant             = Instant.now()
  val id_event: String               = "id_event"
  var updateEvent: EventUpdated      = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    createEvent = EventDraftCreated(
      id = domainid_event,
      timestamp = timestamp,
      id_event = id_event
    )
    updateEvent = EventUpdated(
      id = "updateid_event",
      timestamp = Instant.now(),
      id_event = "updateEvent"
    )

  "EventDraftCreated" should "implement DomainEvent trait correctly" in:
    createEvent shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    createEvent.id shouldBe domainid_event
    createEvent.timestamp shouldBe timestamp
    createEvent.id_event shouldBe id_event

  it should "be comparable with itself" in:
    val event2 = EventDraftCreated(
      id = domainid_event,
      timestamp = timestamp,
      id_event = id_event
    )

    createEvent shouldBe event2

  it should "not be equal with different properties" in:
    val event2 = EventDraftCreated(
      id = "id-2",
      timestamp = Instant.now(),
      id_event = "event-2"
    )

    createEvent should not be event2

  it should "support pattern matching as DomainEvent" in:
    val event: DomainEvent = EventDraftCreated(
      id = "pattern-test",
      timestamp = Instant.now(),
      id_event = "event-pattern"
    )

    val result = event match
      case EventDraftCreated(id, timestamp, id_event) => s"Draft created: $id_event"
      case EventUpdated(id, timestamp, id_event)      => s"Event updated: $id_event"

    result shouldBe "Draft created: event-pattern"

  it should "have correct timestamp precision" in:
    val beforeCreation = Instant.now()

    val event1 = EventDraftCreated(
      id = "timestamp-test",
      timestamp = Instant.now(),
      id_event = "event-timestamp"
    )

    val afterCreation = Instant.now()

    event1.timestamp.isAfter(beforeCreation.minusSeconds(1)) shouldBe true
    event1.timestamp.isBefore(afterCreation.plusSeconds(1)) shouldBe true

  "DomainEvent trait" should "be implemented by EventDraftCreated" in:
    createEvent.id should not be empty
    createEvent.timestamp should not be null

  "EventUpdated" should "implement DomainEvent trait correctly" in:
    val updatedEvent = EventUpdated(
      id = "update-id",
      timestamp = Instant.now(),
      id_event = "update-event-id"
    )
    updatedEvent shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    val updatedEvent = EventUpdated(
      id = "update-id",
      timestamp = Instant.now(),
      id_event = "update-event-id"
    )
    updatedEvent.id shouldBe "update-id"
    updatedEvent.id_event shouldBe "update-event-id"
    updatedEvent.timestamp should not be null

  it should "be comparable with itself" in:
    val updatedEvent2 = EventUpdated(
      id = "updateid_event",
      timestamp = updateEvent.timestamp,
      id_event = "updateEvent"
    )
    updateEvent shouldBe updatedEvent2

  it should "not be equal with different properties" in:
    val updatedEvent2 = EventUpdated(
      id = "different-id",
      timestamp = Instant.now(),
      id_event = "different-event-id"
    )
    updateEvent should not be updatedEvent2

  it should "support pattern matching as DomainEvent" in:
    val event: DomainEvent = EventUpdated(
      id = "id-update",
      timestamp = Instant.now(),
      id_event = "event-id-update"
    )
    val result = event match
      case EventDraftCreated(id, timestamp, id_event) => s"Draft created: $id_event"
      case EventUpdated(id, timestamp, id_event)      => s"Event updated: $id_event"
    result shouldBe "Event updated: event-id-update"
