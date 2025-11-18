package domain.events

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.Instant
import scala.compiletime.uninitialized

class DomainEventTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var event: EventDraftCreated = uninitialized
  val domainEventId            = "domainEventId"
  val timestamp                = Instant.now()
  val eventId                  = "eventId"

  override def beforeEach(): Unit = {
    super.beforeEach()
    event = EventDraftCreated(
      id = domainEventId,
      timestamp = timestamp,
      eventId = eventId
    )
  }

  "EventDraftCreated" should "implement DomainEvent trait correctly" in:
    event shouldBe a[DomainEvent]

  it should "store all provided data correctly" in:
    event.id shouldBe domainEventId
    event.timestamp shouldBe timestamp
    event.eventId shouldBe eventId

  it should "be comparable with itself" in:

    val event2 = EventDraftCreated(
      id = "domainEventId",
      timestamp = timestamp,
      eventId = "eventId"
    )

    event shouldBe event2

  it should "not be equal with different properties" in:
    val event2 = EventDraftCreated(
      id = "id-2",
      timestamp = Instant.now(),
      eventId = "event-2"
    )

    event should not be event2

  it should "support pattern matching as DomainEvent" in:
    val event: DomainEvent = EventDraftCreated(
      id = "pattern-test",
      timestamp = Instant.now(),
      eventId = "event-pattern"
    )

    val result = event match
      case EventDraftCreated(id, timestamp, eventId) => s"Draft created: $eventId"

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
    event.id should not be empty
    event.timestamp should not be null
