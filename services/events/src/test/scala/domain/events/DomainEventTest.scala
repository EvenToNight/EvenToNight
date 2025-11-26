package domain.events

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.Instant
import scala.compiletime.uninitialized

class DomainEventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var createEvent: EventDraftCreated = uninitialized
  val domainEventId: String          = "domainEventId"
  val timestamp: Instant             = Instant.now()
  val eventId: String                = "eventId"
  var updateEvent: EventUpdated      = uninitialized

  override def beforeEach(): Unit =
    super.beforeEach()
    createEvent = EventDraftCreated(
      id = domainEventId,
      timestamp = timestamp,
      eventId = eventId
    )
    updateEvent = EventUpdated(
      id = "updateEventId",
      timestamp = Instant.now(),
      eventId = "updateEvent"
    )

  "EventDraftCreated" should "implement DomainEvent trait correctly" in:
    createEvent shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    createEvent.id shouldBe domainEventId
    createEvent.timestamp shouldBe timestamp
    createEvent.eventId shouldBe eventId

  it should "be comparable with itself" in:
    val event2 = EventDraftCreated(
      id = domainEventId,
      timestamp = timestamp,
      eventId = eventId
    )

    createEvent shouldBe event2

  it should "not be equal with different properties" in:
    val event2 = EventDraftCreated(
      id = "id-2",
      timestamp = Instant.now(),
      eventId = "event-2"
    )

    createEvent should not be event2

  it should "support pattern matching as DomainEvent" in:
    val event: DomainEvent = EventDraftCreated(
      id = "pattern-test",
      timestamp = Instant.now(),
      eventId = "event-pattern"
    )

    val result = event match
      case EventDraftCreated(id, timestamp, eventId) => s"Draft created: $eventId"
      case EventUpdated(id, timestamp, eventId)      => s"Event updated: $eventId"

    result shouldBe "Draft created: event-pattern"

  it should "have correct timestamp precision" in:
    val beforeCreation = Instant.now()

    val event1 = EventDraftCreated(
      id = "timestamp-test",
      timestamp = Instant.now(),
      eventId = "event-timestamp"
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
      eventId = "update-event-id"
    )
    updatedEvent shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    val updatedEvent = EventUpdated(
      id = "update-id",
      timestamp = Instant.now(),
      eventId = "update-event-id"
    )
    updatedEvent.id shouldBe "update-id"
    updatedEvent.eventId shouldBe "update-event-id"
    updatedEvent.timestamp should not be null

  it should "be comparable with itself" in:
    val updatedEvent2 = EventUpdated(
      id = "updateEventId",
      timestamp = updateEvent.timestamp,
      eventId = "updateEvent"
    )
    updateEvent shouldBe updatedEvent2

  it should "not be equal with different properties" in:
    val updatedEvent2 = EventUpdated(
      id = "different-id",
      timestamp = Instant.now(),
      eventId = "different-event-id"
    )
    updateEvent should not be updatedEvent2

  it should "support pattern matching as DomainEvent" in:
    val event: DomainEvent = EventUpdated(
      id = "id-update",
      timestamp = Instant.now(),
      eventId = "event-id-update"
    )
    val result = event match
      case EventDraftCreated(id, timestamp, eventId) => s"Draft created: $eventId"
      case EventUpdated(id, timestamp, eventId)      => s"Event updated: $eventId"
    result shouldBe "Event updated: event-id-update"
