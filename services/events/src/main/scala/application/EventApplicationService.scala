package application

import application.queries.*
import application.usecases.*
import domain.commands.*
import domain.repositories.{DomainEventPublisher, EventRepository, OrganizationRepository, UnitOfWork}
import domain.services.EventDomainService

class EventApplicationService(
    eventRepository: EventRepository,
    organizationRepository: OrganizationRepository,
    eventPublisher: DomainEventPublisher,
    unitOfWork: UnitOfWork
):

  private val eventDomainService = EventDomainService(organizationRepository)

  private val createEventUseCase = CreateEventUseCase(
    eventRepository,
    organizationRepository,
    eventPublisher,
    unitOfWork
  )

  private val updateEventUseCase = UpdateEventUseCase(
    eventRepository,
    eventPublisher,
    eventDomainService
  )

  private val deleteEventUseCase = DeleteEventUseCase(
    eventRepository,
    eventPublisher
  )

  private val updateEventPosterUseCase = UpdateEventPosterUseCase(
    eventRepository,
    eventPublisher
  )

  private val getEventQuery          = GetEventQuery(eventRepository)
  private val getAllEventsQuery      = GetAllEventsQuery(eventRepository)
  private val getFilteredEventsQuery = GetFilteredEventsQuery(eventRepository)

  def handleCommand(cmd: Commands): Either[String, Any] =
    cmd match
      case c: CreateEventCommand       => createEventUseCase.execute(c)
      case c: UpdateEventCommand       => updateEventUseCase.execute(c)
      case c: DeleteEventCommand       => deleteEventUseCase.execute(c)
      case c: UpdateEventPosterCommand => updateEventPosterUseCase.execute(c)
      case c: GetEventCommand          => getEventQuery.execute(c)
      case _: GetAllEventsCommand      => getAllEventsQuery.execute()
      case c: GetFilteredEventsCommand => getFilteredEventsQuery.execute(c)
