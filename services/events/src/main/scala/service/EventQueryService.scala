package service
import domain.commands.GetEventCommand
import domain.models.Event
import infrastructure.db.EventRepository

class EventQueryService(repo: EventRepository):

  def getEvent(cmd: GetEventCommand): Either[String, Event] =
    repo.findById(cmd.id_event) match
      case Some(event) => Right(event)
      case None        => Left(s"Event with id ${cmd.id_event} not found")

  def getAllPublishedEvents(): Either[String, List[Event]] =
    repo.findAllPublished().left.map(err => s"Error retrieving published events: ${err.getMessage}")
