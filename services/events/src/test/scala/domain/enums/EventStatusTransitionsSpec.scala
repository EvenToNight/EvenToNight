package domain.enums

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventStatusTransitionsSpec extends AnyFlatSpec with Matchers:

  import EventStatusTransitions.*

  "isValidTransition" should "allow DRAFT to PUBLISHED" in {
    isValidTransition(EventStatus.DRAFT, EventStatus.PUBLISHED).shouldBe(true)
  }

  it should "not allow DRAFT to CANCELLED" in {
    isValidTransition(EventStatus.DRAFT, EventStatus.CANCELLED).shouldBe(false)
  }

  it should "not allow DRAFT to COMPLETED" in {
    isValidTransition(EventStatus.DRAFT, EventStatus.COMPLETED).shouldBe(false)
  }

  it should "allow PUBLISHED to CANCELLED" in {
    isValidTransition(EventStatus.PUBLISHED, EventStatus.CANCELLED).shouldBe(true)
  }

  it should "not allow PUBLISHED to COMPLETED (based on current transitions)" in {
    isValidTransition(EventStatus.PUBLISHED, EventStatus.COMPLETED).shouldBe(false)
  }

  it should "not allow CANCELLED to any status" in {
    isValidTransition(EventStatus.CANCELLED, EventStatus.DRAFT).shouldBe(false)
    isValidTransition(EventStatus.CANCELLED, EventStatus.PUBLISHED).shouldBe(false)
    isValidTransition(EventStatus.CANCELLED, EventStatus.COMPLETED).shouldBe(false)
  }

  it should "not allow COMPLETED to any status" in {
    isValidTransition(EventStatus.COMPLETED, EventStatus.DRAFT).shouldBe(false)
    isValidTransition(EventStatus.COMPLETED, EventStatus.PUBLISHED).shouldBe(false)
    isValidTransition(EventStatus.COMPLETED, EventStatus.CANCELLED).shouldBe(false)
  }

  it should "allow staying in the same status" in {
    EventStatus.values.foreach { status =>
      isValidTransition(status, status).shouldBe(true)
    }
  }

  "getTransitionErrorMessage" should "provide helpful error messages for invalid trans itions" in {
    val message = getTransitionErrorMessage(EventStatus.COMPLETED, EventStatus.DRAFT)
    message.contains("Cannot transition").shouldBe(true)
  }

  it should "indicate terminal states" in {
    val message = getTransitionErrorMessage(EventStatus.CANCELLED, EventStatus.PUBLISHED)
    message.contains("terminal state").shouldBe(true)
  }
