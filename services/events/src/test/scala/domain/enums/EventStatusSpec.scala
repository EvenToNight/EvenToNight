package domain.enums

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventStatusSpec extends AnyFlatSpec with Matchers:

  "EventStatus.withNameOpt" should "parse valid statuses ignoring case" in {
    EventStatus.withNameOpt("draft") shouldBe Some(EventStatus.DRAFT)
    EventStatus.withNameOpt("PUBLISHED") shouldBe Some(EventStatus.PUBLISHED)
    EventStatus.withNameOpt("Cancelled") shouldBe Some(EventStatus.CANCELLED)
    EventStatus.withNameOpt("cOmpLetEd") shouldBe Some(EventStatus.COMPLETED)
  }

  it should "return None for invalid statuses" in {
    EventStatus.withNameOpt("invalid") shouldBe None
    EventStatus.withNameOpt("") shouldBe None
  }

  it should "throw on null input" in {
    assertThrows[NullPointerException] {
      EventStatus.withNameOpt(null)
    }
  }

  "EventStatus.asString" should "return the string representation" in {
    EventStatus.DRAFT.asString shouldBe "DRAFT"
    EventStatus.PUBLISHED.asString shouldBe "PUBLISHED"
    EventStatus.CANCELLED.asString shouldBe "CANCELLED"
    EventStatus.COMPLETED.asString shouldBe "COMPLETED"
  }

  it should "roundtrip all statuses through withNameOpt" in {
    EventStatus.values.foreach { status =>
      EventStatus.withNameOpt(status.asString).shouldBe(Some(status))
    }
  }
