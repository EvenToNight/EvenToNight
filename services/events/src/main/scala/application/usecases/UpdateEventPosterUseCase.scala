package application.usecases

import domain.commands.UpdateEventPosterCommand
import domain.repositories.{DomainEventPublisher, EventRepository}
import domain.valueobjects.EventId

class UpdateEventPosterUseCase(
    eventRepository: EventRepository,
    eventPublisher: DomainEventPublisher
):

  def execute(command: UpdateEventPosterCommand): Either[String, Unit] =
    for
      eventId <- EventId(command.eventId)
      event <- eventRepository.findById(eventId)
        .toRight(s"Event with id ${command.eventId} not found")
      updatedEvent <- event.updatePoster(command.posterUrl)
      _            <- eventRepository.save(updatedEvent)
    yield
      eventPublisher.publishAll(updatedEvent.domainEvents)
      ()
