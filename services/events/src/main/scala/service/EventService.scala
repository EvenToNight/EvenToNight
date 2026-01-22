package service

import domain.commands.{
  Commands,
  CreateEventCommand,
  DeleteEventCommand,
  GetAllEventsCommand,
  GetEventCommand,
  GetFilteredEventsCommand,
  UpdateEventCommand,
  UpdateEventPosterCommand
}
import domain.commands.validators.Validator
import domain.commands.validators.ValidatorsInstances.given
import infrastructure.db.{EventRepository, MongoUserMetadataRepository}
import infrastructure.messaging.EventPublisher

class EventService(
    eventRepository: EventRepository,
    userMetadataRepository: MongoUserMetadataRepository,
    publisher: EventPublisher
):
  val eventQueryService: EventQueryService    = EventQueryService(eventRepository)
  val eventCommandService: DomainEventService = DomainEventService(eventRepository, userMetadataRepository, publisher)

  def handleCommand(cmd: Commands): Either[String, Any] =
    cmd match
      case c: CreateEventCommand       => validateAnd(c)(eventCommandService.execCommand)
      case c: UpdateEventPosterCommand => validateAnd(c)(eventQueryService.execCommand)
      case c: GetEventCommand          => validateAnd(c)(eventQueryService.execCommand)
      case c: GetAllEventsCommand      => eventQueryService.execCommand(c)
      case c: UpdateEventCommand       => validateAnd(c)(eventCommandService.execCommand)
      case c: DeleteEventCommand       => validateAnd(c)(eventCommandService.execCommand)
      case c: GetFilteredEventsCommand => validateAnd(c)(eventQueryService.execCommand)

  private def validateAnd[C <: Commands, R](cmd: C)(f: C => Either[String, R])(using
      v: Validator[C]
  ): Either[String, R] =
    Validator.validateCommand(cmd) match
      case Left(errors) => Left(errors.mkString(", "))
      case Right(_)     => f(cmd)
