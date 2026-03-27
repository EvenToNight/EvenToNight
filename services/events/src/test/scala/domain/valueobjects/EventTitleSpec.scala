package domain.valueobjects

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventTitleSpec extends AnyFlatSpec with Matchers:

  "EventTitle.apply" should "create a valid EventTitle from a non-empty string" in {
    val result = EventTitle("Summer Festival 2024")
    result.isRight.shouldBe(true)
    result.map(_.value).shouldBe(Right("Summer Festival 2024"))
  }

  it should "reject null values" in {
    val result = EventTitle(null)
    result.shouldBe(Left("Event title cannot be empty"))
  }

  it should "reject empty strings" in {
    val result = EventTitle("")
    result.shouldBe(Left("Event title cannot be empty"))
  }

  it should "reject whitespace-only strings" in {
    val result = EventTitle("   ")
    result.shouldBe(Left("Event title cannot be empty"))
  }

  it should "reject titles shorter than minimum length" in {
    val result = EventTitle("ab")
    result shouldBe Left("Event title must be at least 3 characters long")
  }

  it should "accept titles exactly at max length and reject longer ones" in {
    EventTitle("a" * 200).isRight shouldBe true
    EventTitle("a" * 201) shouldBe Left("Event title must not exceed 200 characters")
  }

  it should "trim valid titles before storing" in {
    EventTitle("   My Event   ").map(_.value) shouldBe Right("My Event")
  }

  "EventTitle.unsafe" should "create an EventTitle without validation" in {
    val title = EventTitle.unsafe("Any title")
    title.value.shouldBe("Any title")
  }

  "EventTitle extensions" should "provide value and asString methods" in {
    val title = EventTitle.unsafe("Concert in the park")
    title.value.shouldBe("Concert in the park")
    title.asString.shouldBe("Concert in the park")
  }
