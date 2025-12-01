package service

import domain.commands.Commands
import domain.commands.CreateEventDraftCommand
import domain.commands.GetAllEventsCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand
import domain.commands.validators.Validator
import domain.commands.validators.ValidatorsInstances.given
import infrastructure.db.EventRepository
import infrastructure.messaging.EventPublisher

class EventService(
    repo: EventRepository,
    publisher: EventPublisher
):
  val eventQueryService: EventQueryService    = EventQueryService(repo)
  val eventCommandService: DomainEventService = DomainEventService(repo, publisher)

  def handleCommand(cmd: Commands): Either[String, Any] =
    cmd match
      case c: CreateEventDraftCommand  => validateAnd(c)(eventCommandService.createEventDraft)
      case c: UpdateEventPosterCommand => validateAnd(c)(eventCommandService.updatePoster)
      case c: GetEventCommand          => validateAnd(c)(eventQueryService.getEvent)
      case _: GetAllEventsCommand      => eventQueryService.getAllPublishedEvents()

  private def validateAnd[C <: Commands, R](cmd: C)(f: C => Either[String, R])(using
      v: Validator[C]
  ): Either[String, R] =
    Validator.validateCommand(cmd) match
      case Left(errors) => Left(errors.mkString(", "))
      case Right(_)     => f(cmd)
