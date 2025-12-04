package service

import domain.commands.CreateEventCommand
import domain.events.EventCreated
import domain.events.EventPublished
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
