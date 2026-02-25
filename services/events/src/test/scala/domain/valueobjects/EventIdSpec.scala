package domain.valueobjects

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventIdSpec extends AnyFlatSpec with Matchers:

  "EventId.apply" should "create a valid EventId from a non-empty string" in {
    val result = EventId("valid-id-123")
    result.isRight.shouldBe(true)
    result.map(_.value).shouldBe(Right("valid-id-123"))
  }

  it should "reject null values" in {
    val result = EventId(null)
    result.shouldBe(Left("EventId cannot be null or empty"))
  }

  it should "reject empty strings" in {
    val result = EventId("")
    result.shouldBe(Left("EventId cannot be null or empty"))
  }

  it should "reject whitespace-only strings" in {
    val result = EventId("   ")
    result.shouldBe(Left("EventId cannot be null or empty"))
  }

  "EventId.generate" should "create unique EventIds" in {
    val id1 = EventId.generate()
    val id2 = EventId.generate()
    (id1 == id2).shouldBe(false)
  }

  "EventId.unsafe" should "create an EventId without validation" in {
    val id = EventId.unsafe("any-string")
    id.value.shouldBe("any-string")
  }

  "EventId extensions" should "provide value and asString methods" in {
    val id = EventId.unsafe("test-id")
    id.value.shouldBe("test-id")
    id.asString.shouldBe("test-id")
  }
