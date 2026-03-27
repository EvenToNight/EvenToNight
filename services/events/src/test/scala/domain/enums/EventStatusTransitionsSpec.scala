package domain.enums

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventStatusTransitionsSpec extends AnyFlatSpec with Matchers:

  import EventStatusTransitions.*

  "isValidTransition" should "allow valid forward transitions" in {
    isValidTransition(EventStatus.DRAFT, EventStatus.PUBLISHED).shouldBe(true)
    isValidTransition(EventStatus.PUBLISHED, EventStatus.CANCELLED).shouldBe(true)
  }

  it should "allow staying in the same status" in {
    EventStatus.values.foreach { status =>
      isValidTransition(status, status).shouldBe(true)
    }
  }

  it should "block invalid forward transitions" in {
    isValidTransition(EventStatus.DRAFT, EventStatus.CANCELLED).shouldBe(false)
    isValidTransition(EventStatus.DRAFT, EventStatus.COMPLETED).shouldBe(false)
    isValidTransition(EventStatus.PUBLISHED, EventStatus.COMPLETED).shouldBe(false)
  }

  it should "block backward transitions" in {
    isValidTransition(EventStatus.PUBLISHED, EventStatus.DRAFT).shouldBe(false)
    isValidTransition(EventStatus.CANCELLED, EventStatus.PUBLISHED).shouldBe(false)
    isValidTransition(EventStatus.CANCELLED, EventStatus.DRAFT).shouldBe(false)
    isValidTransition(EventStatus.COMPLETED, EventStatus.PUBLISHED).shouldBe(false)
    isValidTransition(EventStatus.COMPLETED, EventStatus.DRAFT).shouldBe(false)
  }

  "getTransitionErrorMessage" should "provide helpful error messages for invalid transitions" in {
    val message = getTransitionErrorMessage(EventStatus.DRAFT, EventStatus.COMPLETED)
    message.contains("Cannot transition").shouldBe(true)
    message.contains("Valid transitions from DRAFT are: PUBLISHED").shouldBe(true)
  }

  it should "indicate terminal states for CANCELLED" in {
    val message = getTransitionErrorMessage(EventStatus.CANCELLED, EventStatus.PUBLISHED)
    message.contains("terminal state").shouldBe(true)
  }

  it should "indicate terminal states for COMPLETED" in {
    val message = getTransitionErrorMessage(EventStatus.COMPLETED, EventStatus.DRAFT)
    message.contains("terminal state").shouldBe(true)
  }

  it should "provide generic message if same status" in {
    val message = getTransitionErrorMessage(EventStatus.DRAFT, EventStatus.DRAFT)
    message.contains("already in DRAFT status").shouldBe(true)
  }
