package application.queries

import domain.aggregates.Event
import domain.commands.{GetEventCommand, GetFilteredEventsCommand}
import domain.repositories.EventRepository
import domain.valueobjects.EventId

class GetEventQuery(eventRepository: EventRepository):

  def execute(command: GetEventCommand): Either[String, Event] =
    for
      eventId <- EventId(command.eventId)
      event <- eventRepository.findById(eventId)
        .toRight(s"Event with id ${command.eventId} not found")
    yield event

class GetAllEventsQuery(eventRepository: EventRepository):

  def execute(): Either[String, List[Event]] =
    eventRepository.findAllPublished()

class GetFilteredEventsQuery(eventRepository: EventRepository):

  def execute(command: GetFilteredEventsCommand): Either[String, (List[Event], Boolean)] =
    eventRepository.findByFilters(
      limit = command.limit,
      offset = command.offset,
      status = command.status,
      title = command.title,
      tags = command.tags.map(_.map(_.displayName)),
      startDate = command.startDate,
      endDate = command.endDate,
      organizationId = command.organizationId,
      city = command.city,
      locationName = command.location_name,
      sortBy = command.sortBy,
      sortOrder = command.sortOrder,
      query = command.query,
      near = command.near,
      priceRange = command.price
    )
