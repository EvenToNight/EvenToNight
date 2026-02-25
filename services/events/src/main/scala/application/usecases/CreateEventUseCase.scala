package application.usecases

import domain.aggregates.Event
import domain.commands.CreateEventCommand
import domain.enums.EventStatus
import domain.repositories.{
  DomainEventPublisher,
  EventRepository,
  OrganizationRepository,
  TransactionContext,
  UnitOfWork
}
import domain.valueobjects.{EventDescription, EventId, EventTitle, Location, OrganizationId}
import utils.Utils

class CreateEventUseCase(
    eventRepository: EventRepository,
    organizationRepository: OrganizationRepository,
    eventPublisher: DomainEventPublisher,
    unitOfWork: UnitOfWork
):

  def execute(command: CreateEventCommand): Either[String, String] =

    val eventResult: Either[String, Event] = unitOfWork.execute { ctx =>
      for
        creatorId       <- OrganizationId(command.creatorId)
        _               <- validateCreator(creatorId, ctx)
        collaboratorIds <- convertCollaboratorIds(command.collaboratorIds)
        _               <- validateCollaborators(collaboratorIds, ctx)
        title <- command.title match
          case Some(t) => EventTitle(t).map(Some(_))
          case None    => Right(None)
        description <- command.description match
          case Some(d) => EventDescription(d).map(Some(_))
          case None    => Right(None)
        location <- command.location match
          case Some(loc) => Location(
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
          case None => Right(None)

        event = Event.create(
          title = title,
          description = description,
          poster = command.poster,
          tags = command.tags,
          location = location,
          date = command.date,
          status = command.status,
          creatorId = creatorId,
          collaboratorIds = Some(collaboratorIds)
        )
        
        paymentsServiceUrl = sys.env.getOrElse("PAYMENTS_SERVICE_URL", "http://payments:9050")
        _ <- Utils.notifyPaymentsService(
          eventId = event.id.value,
          creatorId = command.creatorId,
          status = command.status.asString,
          title = event.title.map(_.value),
          date = command.date,
          paymentsServiceUrl = paymentsServiceUrl
        )
        
        _ <- eventRepository.save(event, ctx)
      yield event
    }

    eventResult match
      case Right(event) =>
        eventPublisher.publishAll(event.domainEvents)
        if command.status == EventStatus.PUBLISHED then
          val creatorName = organizationRepository.getOrganizationName(
            OrganizationId.unsafe(command.creatorId)
          ).getOrElse("")
          event.publish(creatorName) match
            case Right(publishedEvent) =>
              eventPublisher.publishAll(publishedEvent.domainEvents)
            case Left(_) =>
        Right(event.id.value)

      case Left(error) =>
        Left(error)

  private def validateCreator(creatorId: OrganizationId, ctx: TransactionContext): Either[String, Unit] =
    if organizationRepository.isOrganization(creatorId, ctx) then
      Right(())
    else
      Left(s"Only organizations can create events. ${creatorId.value} is not an organization.")

  private def convertCollaboratorIds(
      ids: Option[List[String]]
  ): Either[String, List[OrganizationId]] =
    ids match
      case None => Right(List.empty)
      case Some(list) =>
        val results = list.map(OrganizationId.apply)
        val errors  = results.collect { case Left(err) => err }
        if errors.nonEmpty then
          Left(errors.mkString(", "))
        else
          Right(results.collect { case Right(id) => id })

  private def validateCollaborators(
      collaboratorIds: List[OrganizationId],
      ctx: TransactionContext
  ): Either[String, Unit] =
    val invalidCollaborator = collaboratorIds.find { collaboratorId =>
      !organizationRepository.isOrganization(collaboratorId, ctx)
    }

    invalidCollaborator match
      case Some(collaboratorId) =>
        Left(s"Only organizations can be collaborators. ${collaboratorId.value} is not an organization.")
      case None =>
        Right(())
