package service

import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand
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

  def handleCommand(command: CreateEventDraftCommand): String =
    Validator.validateCommand(command) match
      case Left(validationErrors) =>
        ("Validation failed " + validationErrors.mkString(", "))
      case Right(_) =>
        val newEvent =
          Event.createDraft(
            title = command.title,
            description = command.description,
            poster = command.poster,
            tag = command.tag,
            location = command.location,
            date = command.date,
            id_creator = command.id_creator,
            id_collaborator = command.id_collaborator
          )

        repo.save(newEvent)

        val domainEvent = EventDraftCreated(
          id = UUID.randomUUID().toString(),
          timestamp = Instant.now(),
          eventId = newEvent._id
        )

        publisher.publish(domainEvent)

        newEvent._id

  def handleCommand(command: GetEventCommand): Event =
    Validator.validateCommand(command) match
      case Left(_) =>
        Event.nil()
      case Right(_) =>
        val event = repo.findById(command.id_event)
        println(event.getOrElse(Event.nil()).tag)
        event.getOrElse(Event.nil())
