package domain.commands
import domain.models.EventTag

import java.time.LocalDateTime

sealed trait Commands

case class CreateEventDraftCommand(
    title: String,
    description: String,
    poster: String,
    tag: List[EventTag],
    location: String,
    date: LocalDateTime,
    id_creator: String,
    id_collaborator: Option[String]
) extends Commands

case class GetEventCommand(
    id_event: String
) extends Commands

case class UpdateEventPosterCommand(
    eventId: String,
    posterUrl: String
) extends Commands
