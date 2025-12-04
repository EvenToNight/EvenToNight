package domain.commands
import domain.models.EventStatus
import domain.models.EventTag
import domain.models.Location

import java.time.LocalDateTime

sealed trait Commands

case class CreateEventCommand(
    title: String,
    description: String,
    poster: String,
    tag: List[EventTag],
    location: Location,
    date: LocalDateTime,
    price: Double,
    status: EventStatus,
    id_creator: String,
    id_collaborator: Option[String]
) extends Commands

case class UpdateEventPosterCommand(
    id_event: String,
    posterUrl: String
) extends Commands

case class GetEventCommand(
    id_event: String
) extends Commands

case class GetAllEventsCommand() extends Commands
