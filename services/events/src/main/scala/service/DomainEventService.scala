package service

import domain.commands.CreateEventCommand
import domain.commands.UpdateEventCommand
import domain.events.EventCreated
import domain.events.EventPublished
import domain.events.EventUpdated
import domain.models.Event
import domain.models.EventStatus
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
        tag = cmd.tag,
        location = cmd.location,
        date = cmd.date,
        price = cmd.price,
        status = cmd.status,
        id_creator = cmd.id_creator,
        id_collaborator = cmd.id_collaborator
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
          title = cmd.title.getOrElse(event.title),
          description = cmd.description.getOrElse(event.description),
          tag = cmd.tag.getOrElse(event.tag),
          location = cmd.location.getOrElse(event.location),
          date = cmd.date.getOrElse(event.date),
          price = cmd.price.getOrElse(event.price),
          status = cmd.status.getOrElse(event.status),
          id_collaborator = cmd.id_collaborator.orElse(event.id_collaborator)
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
