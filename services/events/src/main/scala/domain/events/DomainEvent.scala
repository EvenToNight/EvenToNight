package domain.events

sealed trait DomainEvent

case class EventPublished(
    eventId: String,
    creatorId: String,
    collaboratorIds: Option[List[String]]
) extends DomainEvent

case class EventUpdated(
    eventId: String,
    collaboratorIds: Option[List[String]]
) extends DomainEvent

case class EventDeleted(
    eventId: String
) extends DomainEvent

case class EventCompleted(
    eventId: String
) extends DomainEvent
