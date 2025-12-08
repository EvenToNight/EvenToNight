package domain.models
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventStatusTest extends AnyFlatSpec with Matchers:

  "EventStatus enum" should "have correct string representations" in:
    EventStatus.DRAFT.toString shouldBe "DRAFT"
    EventStatus.PUBLISHED.toString shouldBe "PUBLISHED"
    EventStatus.CANCELLED.toString shouldBe "CANCELLED"
    EventStatus.COMPLETED.toString shouldBe "COMPLETED"

  it should "contain all expected values" in:
    EventStatus.values should contain allOf (
      EventStatus.DRAFT,
      EventStatus.PUBLISHED,
      EventStatus.CANCELLED,
      EventStatus.COMPLETED
    )

  it should "have exactly 4 values" in:
    EventStatus.values should have length 4

  it should "be comparable with itself" in:
    EventStatus.DRAFT shouldBe EventStatus.DRAFT
    EventStatus.PUBLISHED shouldBe EventStatus.PUBLISHED
    EventStatus.CANCELLED shouldBe EventStatus.CANCELLED
    EventStatus.COMPLETED shouldBe EventStatus.COMPLETED

  it should "support pattern matching" in:
    def statusDescription(status: EventStatus): String = status match
      case EventStatus.DRAFT     => "In preparation"
      case EventStatus.PUBLISHED => "Live event"
      case EventStatus.CANCELLED => "Event cancelled"
      case EventStatus.COMPLETED => "Event finished"

    statusDescription(EventStatus.DRAFT) shouldBe "In preparation"
    statusDescription(EventStatus.PUBLISHED) shouldBe "Live event"
    statusDescription(EventStatus.CANCELLED) shouldBe "Event cancelled"
    statusDescription(EventStatus.COMPLETED) shouldBe "Event finished"
