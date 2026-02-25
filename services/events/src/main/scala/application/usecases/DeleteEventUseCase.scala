package application.usecases

import domain.commands.DeleteEventCommand
import domain.repositories.{DomainEventPublisher, EventRepository}
import domain.valueobjects.EventId

class DeleteEventUseCase(
    eventRepository: EventRepository,
    eventPublisher: DomainEventPublisher
):

  def execute(command: DeleteEventCommand): Either[String, Unit] =
    for
      eventId <- EventId(command.eventId)

      event <- eventRepository.findById(eventId)
        .toRight(s"Event with id ${command.eventId} not found")

      _ <- if event.shouldBeSoftDeleted then
        for
          cancelledEvent <- event.cancel()
          _              <- eventRepository.save(cancelledEvent)
        yield
          eventPublisher.publishAll(cancelledEvent.domainEvents)
          ()
      else if event.canBeHardDeleted then
        for
          eventToDelete <- event.prepareForDeletion()
          _ = eventPublisher.publishAll(eventToDelete.domainEvents)
          _ <- eventRepository.delete(eventId)
        yield ()
      else
        Left(s"Event with status ${event.status.asString} cannot be deleted")
    yield ()
