package service

import domain.commands.Commands
import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand
import domain.commands.validators.Validator
import domain.commands.validators.ValidatorsInstances.given
import domain.events.EventDraftCreated
import domain.models.Event
import infrastructure.db.EventRepository
import infrastructure.messaging.EventPublisher

import java.time.Instant
import java.util.UUID

class EventService(
    repo: EventRepository,
    publisher: EventPublisher
):

  def handleCommand(cmd: Commands): Either[String, Any] =
    cmd match
      case c: CreateEventDraftCommand  => validateAnd(c)(createEventDraft)
      case c: GetEventCommand          => validateAnd(c)(getEvent)
      case c: UpdateEventPosterCommand => validateAndFlatten(c)(updatePoster)

  private def validateAnd[C <: Commands, R](cmd: C)(f: C => R)(using v: Validator[C]): Either[String, R] =
    Validator.validateCommand(cmd) match
      case Left(errors) => Left(errors.mkString(", "))
      case Right(_)     => Right(f(cmd))

  private def validateAndFlatten[C <: Commands, R](cmd: C)(f: C => Either[String, R])(using
      v: Validator[C]
  ): Either[String, R] =
    Validator.validateCommand(cmd) match
      case Left(errors) => Left(errors.mkString(", "))
      case Right(_)     => f(cmd)

  private def createEventDraft(cmd: CreateEventDraftCommand): String =
    val newEvent =
      Event.createDraft(
        title = cmd.title,
        description = cmd.description,
        poster = cmd.poster,
        tag = cmd.tag,
        location = cmd.location,
        date = cmd.date,
        id_creator = cmd.id_creator,
        id_collaborator = cmd.id_collaborator
      )

    repo.save(newEvent)

    publisher.publish(
      EventDraftCreated(
        id = UUID.randomUUID().toString(),
        timestamp = Instant.now(),
        eventId = newEvent._id
      )
    )

    newEvent._id

  private def getEvent(cmd: GetEventCommand): Event =
    repo.findById(cmd.id_event)
      .getOrElse(Event.nil())

  private def updatePoster(cmd: UpdateEventPosterCommand): Either[String, Unit] =
    repo.findById(cmd.eventId) match
      case Some(event) =>
        repo.update(event.copy(poster = cmd.posterUrl))
        Right(())
      case None =>
        Left(s"Event ${cmd.eventId} not found")
