package service

import domain.commands.{CreateEventCommand, DeleteEventCommand, UpdateEventCommand}
import domain.events.{EventCancelled, EventCreated, EventDeleted, EventPublished, EventUpdated}
import domain.models.{Event, EventStatus}
import infrastructure.db.{EventRepository, MongoUserMetadataRepository}
import infrastructure.messaging.EventPublisher
import utils.Utils

class DomainEventService(
    eventRepository: EventRepository,
    userMetadataRepository: MongoUserMetadataRepository,
    publisher: EventPublisher
):

  def execCommand(cmd: CreateEventCommand): Either[String, String] =
    if !Utils.checkUserIsOrganization(cmd.creatorId, userMetadataRepository) then
      Left(s"Only organizations can create events. ${cmd.creatorId} is not an organization.")
    else
      cmd.collaboratorIds.getOrElse(List()).find(collaboratorId =>
        !Utils.checkUserIsOrganization(collaboratorId, userMetadataRepository)
      ) match
        case Some(collaboratorId) =>
          Left(s"Only organizations can be collaborators. $collaboratorId is not an organization.")
        case None =>
          val newEvent =
            Event.create(
              title = cmd.title,
              description = cmd.description,
              poster = cmd.poster,
              tags = cmd.tags,
              location = cmd.location,
              date = cmd.date,
              status = cmd.status,
              creatorId = cmd.creatorId,
              collaboratorIds = cmd.collaboratorIds
            )
          eventRepository.save(newEvent) match
            case Left(_) =>
              Left("Failed to save new event")
            case Right(_) =>
              publisher.publish(
                EventCreated(
                  eventId = newEvent._id,
                  creatorId = cmd.creatorId,
                  collaboratorIds = cmd.collaboratorIds,
                  name = cmd.title,
                  date = cmd.date,
                  status = cmd.status.asString
                )
              )
              if cmd.status == EventStatus.PUBLISHED then
                publisher.publish(
                  EventPublished(
                    eventId = newEvent._id
                  )
                )
              Right(newEvent._id)

  def execCommand(cmd: UpdateEventCommand): Either[String, Unit] =
    cmd.collaboratorIds.getOrElse(List()).find(collaboratorId =>
      !Utils.checkUserIsOrganization(collaboratorId, userMetadataRepository)
    ) match
      case Some(collaboratorId) =>
        Left(s"Only organizations can be collaborators. $collaboratorId is not an organization.")
      case None =>
        eventRepository.findById(cmd.eventId) match
          case Some(event) =>
            val updatedEvent = event.copy(
              title = cmd.title,
              description = cmd.description,
              tags = cmd.tags,
              location = cmd.location,
              date = cmd.date,
              status = cmd.status,
              collaboratorIds = cmd.collaboratorIds.orElse(event.collaboratorIds)
            )
            eventRepository.update(updatedEvent) match
              case Left(_) =>
                Left(s"Failed to update event with id ${cmd.eventId}")
              case Right(_) =>
                publisher.publish(
                  EventUpdated(
                    eventId = updatedEvent._id,
                    collaboratorIds = updatedEvent.collaboratorIds,
                    name = updatedEvent.title,
                    date = updatedEvent.date,
                    status = updatedEvent.status.asString
                  )
                )
                if event.status != EventStatus.PUBLISHED && updatedEvent.status == EventStatus.PUBLISHED then
                  publisher.publish(
                    EventPublished(
                      eventId = updatedEvent._id
                    )
                  )
                Right(())
          case None =>
            Left(s"Event with id ${cmd.eventId} not found")

  def execCommand(cmd: DeleteEventCommand): Either[String, Unit] =
    eventRepository.findById(cmd.eventId) match
      case None =>
        Left(s"Event with id ${cmd.eventId} not found")
      case Some(event) =>
        event.status match
          case EventStatus.PUBLISHED =>
            eventRepository.update(event.copy(status = EventStatus.CANCELLED)) match
              case Left(_) =>
                Left(s"Failed to cancel event with id ${cmd.eventId}")
              case Right(_) =>
                publisher.publish(
                  EventCancelled(
                    eventId = cmd.eventId
                  )
                )
                Right(())
          case _ =>
            eventRepository.delete(cmd.eventId) match
              case Left(_) =>
                Left(s"Failed to delete event with id ${cmd.eventId}")
              case Right(_) =>
                publisher.publish(
                  EventDeleted(
                    eventId = cmd.eventId
                  )
                )
                Right(())
