package domain.exceptions

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class DomainExceptionsSpec extends AnyFlatSpec with Matchers:

  "BusinessRuleViolationException" should "contain the correct message" in {
    val ex = BusinessRuleViolationException("Rule violated")
    ex.getMessage shouldBe "Rule violated"
  }

  "AggregateNotFoundException" should "format the message correctly" in {
    val ex = AggregateNotFoundException("123", "Event")
    ex.getMessage shouldBe "Event with id 123 not found"
    ex.aggregateId shouldBe "123"
    ex.aggregateType shouldBe "Event"
  }

  "InvalidStateTransitionException" should "format the message correctly" in {
    val ex = InvalidStateTransitionException("DRAFT", "COMPLETED")
    ex.getMessage shouldBe "Invalid state transition from DRAFT to COMPLETED"
    ex.from shouldBe "DRAFT"
    ex.to shouldBe "COMPLETED"
  }

  "ValidationException" should "join errors with comma" in {
    val errors = List("Error 1", "Error 2")
    val ex = ValidationException(errors)
    ex.getMessage shouldBe "Error 1, Error 2"
    ex.errors shouldBe errors
  }
