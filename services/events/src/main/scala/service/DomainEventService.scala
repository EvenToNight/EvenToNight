package service

import domain.commands.{CreateEventCommand, DeleteEventCommand, UpdateEventCommand}
import domain.events.{EventDeleted, EventPublished, EventUpdated}
import domain.models.{Event, EventStatus}
import infrastructure.db.EventRepository
import infrastructure.messaging.EventPublisher

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
        collaboratorIds = cmd.collaboratorIds
      )
    repo.save(newEvent) match
      case Left(_) =>
        Left("Failed to save new event")
      case Right(_) =>
        if cmd.status == EventStatus.PUBLISHED then
          publisher.publish(
            EventPublished(
              eventId = newEvent._id,
              creatorId = cmd.creatorId,
              collaboratorIds = cmd.collaboratorIds,
              name = cmd.title.getOrElse("Unnamed Event")
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
          collaboratorIds = cmd.collaboratorIds.orElse(event.collaboratorIds)
        )
        repo.update(updatedEvent) match
          case Left(_) =>
            Left(s"Failed to update event with id ${cmd.eventId}")
          case Right(_) =>
            if event.status != EventStatus.PUBLISHED && updatedEvent.status == EventStatus.PUBLISHED then
              publisher.publish(
                EventPublished(
                  eventId = updatedEvent._id,
                  creatorId = updatedEvent.creatorId,
                  collaboratorIds = updatedEvent.collaboratorIds,
                  name = updatedEvent.title.getOrElse("Unnamed Event")
                )
              )
            else
              publisher.publish(
                EventUpdated(
                  eventId = updatedEvent._id,
                  collaboratorIds = updatedEvent.collaboratorIds
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
                    eventId = cmd.eventId
                  )
                )
                Right(())
