package service

import domain.Commands.CreateEventDraftCommand
import domain.Event
import infrastructure.db.EventRepository
import infrastructure.messaging.EventPublisher

class EventService(
    repo: EventRepository,
    publisher: EventPublisher
) {

  def handleCreateDraft(command: CreateEventDraftCommand): String = {

    val (newEvent, eventToPublish) = Event.create(command)

    repo.save(newEvent)

    publisher.publish(eventToPublish)

    newEvent._id
  }
}
