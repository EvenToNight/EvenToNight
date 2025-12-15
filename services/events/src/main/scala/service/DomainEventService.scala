package service

import domain.commands.{CreateEventCommand, DeleteEventCommand, UpdateEventCommand}
import domain.events.{EventCreated, EventDeleted, EventPublished, EventUpdated}
import domain.models.{Event, EventStatus}
import infrastructure.db.EventRepository
import infrastructure.messaging.EventPublisher

import java.time.Instant
import java.util.UUID

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
        id_creator = cmd.id_creator,
        id_collaborators = cmd.id_collaborators
      )
    repo.save(newEvent) match
      case Left(_) =>
        Left("Failed to save new event")
      case Right(_) =>
        publisher.publish(
          EventCreated(
            id = UUID.randomUUID().toString(),
            timestamp = Instant.now(),
            id_event = newEvent._id
          )
        )
        if cmd.status == EventStatus.PUBLISHED then
          publisher.publish(
            EventPublished(
              id = UUID.randomUUID().toString(),
              timestamp = Instant.now(),
              id_event = newEvent._id
            )
          )
        Right(newEvent._id)

  def execCommand(cmd: UpdateEventCommand): Either[String, Unit] =
    repo.findById(cmd.id_event) match
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
            Left(s"Failed to update event with id ${cmd.id_event}")
          case Right(_) =>
            if event.status != EventStatus.PUBLISHED && updatedEvent.status == EventStatus.PUBLISHED then
              publisher.publish(
                EventPublished(
                  id = UUID.randomUUID().toString(),
                  timestamp = Instant.now(),
                  id_event = updatedEvent._id
                )
              )
            else
              publisher.publish(
                EventUpdated(
                  id = UUID.randomUUID().toString(),
                  timestamp = Instant.now(),
                  id_event = updatedEvent._id
                )
              )
            Right(())
      case None =>
        Left(s"Event with id ${cmd.id_event} not found")

  def execCommand(cmd: DeleteEventCommand): Either[String, Unit] =
    repo.findById(cmd.id_event) match
      case None =>
        Left(s"Event with id ${cmd.id_event} not found")
      case Some(event) =>
        event.status match
          case EventStatus.PUBLISHED =>
            repo.update(event.copy(status = EventStatus.CANCELLED)) match
              case Left(_) =>
                Left(s"Failed to cancel event with id ${cmd.id_event}")
              case Right(_) =>
                publisher.publish(
                  EventDeleted(
                    id = UUID.randomUUID().toString(),
                    timestamp = Instant.now(),
                    id_event = cmd.id_event
                  )
                )
                Right(())
          case _ =>
            repo.delete(cmd.id_event) match
              case Left(_) =>
                Left(s"Failed to delete event with id ${cmd.id_event}")
              case Right(_) =>
                publisher.publish(
                  EventDeleted(
                    id = UUID.randomUUID().toString(),
                    timestamp = Instant.now(),
                    id_event = cmd.id_event
                  )
                )
                Right(())
