package domain.commands
import domain.models.{EventStatus, EventTag, Location}

import java.time.LocalDateTime

sealed trait Commands

case class CreateEventCommand(
    title: Option[String] = None,
    description: Option[String] = None,
    poster: Option[String] = None,
    tags: Option[List[EventTag]] = None,
    location: Option[Location] = None,
    date: Option[LocalDateTime] = None,
    price: Option[Double] = None,
    status: EventStatus,
    id_creator: String,
    id_collaborators: Option[List[String]] = None
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
    tags: Option[List[EventTag]],
    location: Option[Location],
    date: Option[LocalDateTime],
    price: Option[Double],
    status: EventStatus,
    id_collaborators: Option[List[String]]
) extends Commands

case class DeleteEventCommand(
    id_event: String
) extends Commands

case class GetFilteredEventsCommand(
    limit: Option[Int],
    offset: Option[Int],
    status: Option[EventStatus],
    title: Option[String],
    tags: Option[List[EventTag]],
    startDate: Option[LocalDateTime],
    endDate: Option[LocalDateTime],
    id_organization: Option[String],
    city: Option[String],
    location_name: Option[String]
) extends Commands
