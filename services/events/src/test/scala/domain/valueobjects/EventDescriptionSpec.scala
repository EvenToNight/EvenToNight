package domain.valueobjects

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventDescriptionSpec extends AnyFlatSpec with Matchers:

  "EventDescription.apply" should "create a valid EventDescription from a non-empty string" in {
    val result = EventDescription("A detailed description about this event.")
    result.isRight.shouldBe(true)
    result.map(_.value).shouldBe(Right("A detailed description about this event."))
  }

  it should "reject null values" in {
    val result = EventDescription(null)
    result.shouldBe(Left("Event description cannot be null"))
  }

  it should "accept empty strings" in {
    val result = EventDescription("")
    result.isRight.shouldBe(true)
    result.map(_.value).shouldBe(Right(""))
  }

  it should "accept whitespace-only strings" in {
    val result = EventDescription("   ")
    result.isRight.shouldBe(true)
    result.map(_.value).shouldBe(Right(""))
  }

  "EventDescription.unsafe" should "create an EventDescription without validation" in {
    val description = EventDescription.unsafe("Any description")
    description.value.shouldBe("Any description")
  }

  "EventDescription extensions" should "provide value and asString methods" in {
    val description = EventDescription.unsafe("Desc")
    description.value.shouldBe("Desc")
    description.asString.shouldBe("Desc")
  }
