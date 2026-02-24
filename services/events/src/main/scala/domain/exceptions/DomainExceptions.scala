package domain.exceptions

sealed abstract class DomainException(message: String) extends Exception(message)

case class BusinessRuleViolationException(message: String) extends DomainException(message)

case class AggregateNotFoundException(aggregateId: String, aggregateType: String)
    extends DomainException(s"$aggregateType with id $aggregateId not found")

case class InvalidStateTransitionException(from: String, to: String)
    extends DomainException(s"Invalid state transition from $from to $to")

case class ValidationException(errors: List[String])
    extends DomainException(errors.mkString(", "))
