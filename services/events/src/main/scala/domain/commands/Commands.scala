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
    status: EventStatus,
    creatorId: String,
    collaboratorIds: Option[List[String]] = None
) extends Commands

case class UpdateEventPosterCommand(
    eventId: String,
    posterUrl: String
) extends Commands

case class GetEventCommand(
    eventId: String
) extends Commands

case class GetAllEventsCommand() extends Commands

case class UpdateEventCommand(
    eventId: String,
    title: Option[String],
    description: Option[String],
    tags: Option[List[EventTag]],
    location: Option[Location],
    date: Option[LocalDateTime],
    status: EventStatus,
    collaboratorIds: Option[List[String]]
) extends Commands

case class DeleteEventCommand(
    eventId: String
) extends Commands

case class GetFilteredEventsCommand(
    limit: Option[Int],
    offset: Option[Int],
    status: Option[List[EventStatus]],
    title: Option[String],
    tags: Option[List[EventTag]],
    startDate: Option[LocalDateTime],
    endDate: Option[LocalDateTime],
    organizationId: Option[String],
    city: Option[String],
    location_name: Option[String],
    sortBy: Option[String],
    sortOrder: Option[String],
    query: Option[String],
    near: Option[(Double, Double)],
    other: Option[String] = None,
    price: Option[(Double, Double)] = None
) extends Commands
