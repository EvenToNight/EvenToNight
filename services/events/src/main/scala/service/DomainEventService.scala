package service

import domain.commands.CreateEventDraftCommand
import domain.commands.UpdateEventPosterCommand
import domain.events.EventDraftCreated
import domain.events.EventUpdated
import domain.models.Event
import infrastructure.db.EventRepository
import infrastructure.messaging.EventPublisher

import java.time.Instant
import java.util.UUID

class DomainEventService(repo: EventRepository, publisher: EventPublisher):

  def createEventDraft(cmd: CreateEventDraftCommand): Either[String, String] =
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
    repo.save(newEvent) match
      case Left(_) =>
        Left("Failed to save new event")
      case Right(_) =>
        publisher.publish(
          EventDraftCreated(
            id = UUID.randomUUID().toString(),
            timestamp = Instant.now(),
            eventId = newEvent._id
          )
        )
        Right(newEvent._id)

  def updatePoster(cmd: UpdateEventPosterCommand): Either[String, Unit] =
    repo.findById(cmd.eventId) match
      case Some(event) =>
        repo.update(event.copy(poster = cmd.posterUrl))
        publisher.publish(
          EventUpdated(
            id = UUID.randomUUID().toString(),
            timestamp = Instant.now(),
            eventId = cmd.eventId
          )
        )
        Right(())
      case None =>
        Left(s"Event ${cmd.eventId} not found")
