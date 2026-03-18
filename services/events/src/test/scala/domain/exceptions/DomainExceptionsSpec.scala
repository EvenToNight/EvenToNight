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
    val ex     = ValidationException(errors)
    ex.getMessage shouldBe "Error 1, Error 2"
    ex.errors shouldBe errors
  }

  "Domain exceptions" should "behave as DomainException subtypes" in {
    val business   = BusinessRuleViolationException("X")
    val notFound   = AggregateNotFoundException("a-1", "Event")
    val invalid    = InvalidStateTransitionException("DRAFT", "PUBLISHED")
    val validation = ValidationException(List("a", "b"))

    business.isInstanceOf[DomainException] shouldBe true
    notFound.isInstanceOf[DomainException] shouldBe true
    invalid.isInstanceOf[DomainException] shouldBe true
    validation.isInstanceOf[DomainException] shouldBe true

    business.productPrefix shouldBe "BusinessRuleViolationException"
    notFound.productArity shouldBe 2
    invalid.productArity shouldBe 2
    validation.productArity shouldBe 1
  }

  it should "support copy, equality and extractors" in {
    val businessBase                                    = BusinessRuleViolationException("base")
    val businessCopy                                    = businessBase.copy(message = "copy")
    val BusinessRuleViolationException(businessMessage) = businessCopy
    businessMessage shouldBe "copy"

    val notFoundBase                                           = AggregateNotFoundException("e-1", "Event")
    val notFoundCopy                                           = notFoundBase.copy(aggregateId = "e-2")
    val AggregateNotFoundException(aggregateId, aggregateType) = notFoundCopy
    aggregateId shouldBe "e-2"
    aggregateType shouldBe "Event"

    val transitionBase                            = InvalidStateTransitionException("DRAFT", "COMPLETED")
    val transitionCopy                            = transitionBase.copy(to = "PUBLISHED")
    val InvalidStateTransitionException(from, to) = transitionCopy
    from shouldBe "DRAFT"
    to shouldBe "PUBLISHED"

    val validationBase                       = ValidationException(List("e1"))
    val validationCopy                       = validationBase.copy(errors = List("e1", "e2"))
    val ValidationException(extractedErrors) = validationCopy
    extractedErrors shouldBe List("e1", "e2")
    validationCopy shouldBe ValidationException(List("e1", "e2"))
  }

  it should "cover equals/hashCode branches for exception case classes" in {
    val business = BusinessRuleViolationException("m")
    business.equals(null) shouldBe false
    business.equals("x") shouldBe false
    business.hashCode shouldBe BusinessRuleViolationException("m").hashCode

    val notFound = AggregateNotFoundException("id", "Event")
    notFound.equals(null) shouldBe false
    notFound.equals(1) shouldBe false
    notFound.hashCode shouldBe AggregateNotFoundException("id", "Event").hashCode

    val transition = InvalidStateTransitionException("A", "B")
    transition.equals(null) shouldBe false
    transition.equals(notFound) shouldBe false

    val validation = ValidationException(List("e1", "e2"))
    validation.equals(null) shouldBe false
    validation.equals(transition) shouldBe false
  }
