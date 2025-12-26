package service

import domain.commands.{CreateEventCommand, DeleteEventCommand, UpdateEventCommand}
import domain.events.{EventDeleted, EventPublished, EventUpdated}
import domain.models.{Event, EventStatus}
import infrastructure.db.EventRepository
import infrastructure.messaging.EventPublisher

import java.time.Instant

class DomainEventService(repo: EventRepository, publisher: EventPublisher):

  def execCommand(cmd: CreateEventCommand): Either[String, String] =
    val newEvent =
      Event.create(
        title = cmd.title,
        description = cmd.description,
        poster = cmd.poster,
        tags = cmd.tags,
        location = cmd.location,
        date = cmd.date,
        price = cmd.price,
        status = cmd.status,
        creatorId = cmd.creatorId,
        id_collaborators = cmd.id_collaborators
      )
    repo.save(newEvent) match
      case Left(_) =>
        Left("Failed to save new event")
      case Right(_) =>
        if cmd.status == EventStatus.PUBLISHED then
          publisher.publish(
            EventPublished(
              timestamp = Instant.now(),
              eventId = newEvent._id,
              creatorId = cmd.creatorId,
              id_collaborators = cmd.id_collaborators
            )
          )
        Right(newEvent._id)

  def execCommand(cmd: UpdateEventCommand): Either[String, Unit] =
    repo.findById(cmd.eventId) match
      case Some(event) =>
        val updatedEvent = event.copy(
          title = cmd.title,
          description = cmd.description,
          tags = cmd.tags,
          location = cmd.location,
          date = cmd.date,
          price = cmd.price,
          status = cmd.status,
          id_collaborators = cmd.id_collaborators.orElse(event.id_collaborators)
        )
        repo.update(updatedEvent) match
          case Left(_) =>
            Left(s"Failed to update event with id ${cmd.eventId}")
          case Right(_) =>
            if event.status != EventStatus.PUBLISHED && updatedEvent.status == EventStatus.PUBLISHED then
              publisher.publish(
                EventPublished(
                  timestamp = Instant.now(),
                  eventId = updatedEvent._id,
                  creatorId = updatedEvent.creatorId,
                  id_collaborators = updatedEvent.id_collaborators
                )
              )
            else
              publisher.publish(
                EventUpdated(
                  timestamp = Instant.now(),
                  eventId = updatedEvent._id
                )
              )
            Right(())
      case None =>
        Left(s"Event with id ${cmd.eventId} not found")

  def execCommand(cmd: DeleteEventCommand): Either[String, Unit] =
    repo.findById(cmd.eventId) match
      case None =>
        Left(s"Event with id ${cmd.eventId} not found")
      case Some(event) =>
        event.status match
          case EventStatus.PUBLISHED =>
            repo.update(event.copy(status = EventStatus.CANCELLED)) match
              case Left(_) =>
                Left(s"Failed to cancel event with id ${cmd.eventId}")
              case Right(_) =>
                publisher.publish(
                  EventDeleted(
                    timestamp = Instant.now(),
                    eventId = cmd.eventId
                  )
                )
                Right(())
          case _ =>
            repo.delete(cmd.eventId) match
              case Left(_) =>
                Left(s"Failed to delete event with id ${cmd.eventId}")
              case Right(_) =>
                publisher.publish(
                  EventDeleted(
                    timestamp = Instant.now(),
                    eventId = cmd.eventId
                  )
                )
                Right(())
