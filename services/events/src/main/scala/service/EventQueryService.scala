package service
import domain.commands.{GetAllEventsCommand, GetEventCommand, GetFilteredEventsCommand, UpdateEventPosterCommand}
import domain.models.Event
import infrastructure.db.EventRepository

class EventQueryService(repo: EventRepository):

  def execCommand(cmd: GetEventCommand): Either[String, Event] =
    repo.findById(cmd.id_event) match
      case Some(event) => Right(event)
      case None        => Left(s"Event with id ${cmd.id_event} not found")

  def execCommand(cmd: GetAllEventsCommand): Either[String, List[Event]] =
    repo.findAllPublished().left.map(err => s"Error in ${cmd.getClass.getSimpleName}: ${err.getMessage}")

  def execCommand(cmd: UpdateEventPosterCommand): Either[String, Unit] =
    repo.findById(cmd.id_event) match
      case Some(event) =>
        repo.update(event.copy(poster = cmd.posterUrl))
        Right(())
      case None =>
        Left(s"Event ${cmd.id_event} not found")

  def execCommand(cmd: GetFilteredEventsCommand): Either[String, List[Event]] =
    repo.findByFilters(
      limit = cmd.limit,
      offset = cmd.offset,
      status = cmd.status,
      title = cmd.title,
      tags = cmd.tags.map(_.map(_.displayName)),
      startDate = cmd.startDate.map(_.toString()),
      endDate = cmd.endDate.map(_.toString()),
      id_organization = cmd.id_organization,
      city = cmd.city,
      location_name = cmd.location_name
    ).left.map(err => s"Error in ${cmd.getClass.getSimpleName}: ${err.getMessage}")
