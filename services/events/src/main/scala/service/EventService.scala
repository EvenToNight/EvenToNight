package service

import domain.Commands.CreateEventDraftCommand
import domain.Event
import infrastructure.db.EventRepository
import infrastructure.messaging.EventPublisher

import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class EventService(
    repo: EventRepository,
    publisher: EventPublisher
)(implicit ec: ExecutionContext) {

  def handleCreateDraft(command: CreateEventDraftCommand): Future[String] = {

    val (newEvent, eventToPublish) = Event.create(command)

    val saveFuture = repo.save(newEvent)

    saveFuture.map { _ =>
      publisher.publish(eventToPublish)
      newEvent.id
    }
  }
}
