package domain.commands
import domain.models.{EventStatus, EventTag, Location}

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

case class UpdateEventCommand(
    id_event: String,
    title: Option[String],
    description: Option[String],
    tag: Option[List[EventTag]],
    location: Option[Location],
    date: Option[LocalDateTime],
    price: Option[Double],
    status: Option[EventStatus],
    id_collaborator: Option[String]
) extends Commands

case class DeleteEventCommand(
    id_event: String
) extends Commands
