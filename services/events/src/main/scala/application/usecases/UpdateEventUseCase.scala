package application.usecases

import domain.commands.UpdateEventCommand
import domain.repositories.{DomainEventPublisher, EventRepository}
import domain.services.EventDomainService
import domain.valueobjects.*

class UpdateEventUseCase(
    eventRepository: EventRepository,
    eventPublisher: DomainEventPublisher,
    eventDomainService: EventDomainService
):

  def execute(command: UpdateEventCommand): Either[String, Unit] =
    for
      eventId <- EventId(command.eventId)
      event <- eventRepository.findById(eventId)
        .toRight(s"Event with id ${command.eventId} not found")
      collaboratorIds <- convertCollaboratorIds(command.collaboratorIds)
      _ <- if collaboratorIds.isDefined then
        eventDomainService.validateCollaboratorsAreOrganizations(
          collaboratorIds.get
        )
      else
        Right(())
      title <- command.title.map(EventTitle.apply)
        .map(_.map(Some(_)))
        .getOrElse(Right(event.title))
      description <- command.description.map(EventDescription.apply)
        .map(_.map(Some(_)))
        .getOrElse(Right(event.description))
      location <- command.location.map(loc =>
        Location(
          name = loc.name,
          country = loc.country,
          countryCode = loc.country_code,
          state = loc.state,
          province = loc.province,
          city = loc.city,
          road = loc.road,
          postcode = loc.postcode,
          houseNumber = loc.house_number,
          lat = loc.lat,
          lon = loc.lon,
          link = loc.link
        ).map(Some(_))
      ).getOrElse(Right(event.location))
      creatorName = eventDomainService.getOrganizationNameOrEmpty(event.creatorId)
      updatedEvent <- event.update(
        newTitle = title,
        newDescription = description,
        newTags = command.tags,
        newLocation = location,
        newDate = command.date,
        newStatus = command.status,
        newCollaboratorIds = collaboratorIds,
        creatorName = creatorName
      )
      _ <- eventRepository.save(updatedEvent)
    yield
      eventPublisher.publishAll(updatedEvent.domainEvents)
      ()

  private def convertCollaboratorIds(
      ids: Option[List[String]]
  ): Either[String, Option[List[OrganizationId]]] =
    ids match
      case None => Right(None)
      case Some(list) =>
        val results = list.map(OrganizationId.apply)
        val errors  = results.collect { case Left(err) => err }
        if errors.nonEmpty then
          Left(errors.mkString(", "))
        else
          Right(Some(results.collect { case Right(id) => id }))
