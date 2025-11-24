package domain.commands.validators

import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand

import ValidationRules.{futureDate, nonEmpty}
import Validator.combine

object CreateEventDraftValidator extends Validator[CreateEventDraftCommand]:

  override def validate(cmd: CreateEventDraftCommand): Either[List[String], CreateEventDraftCommand] =
    val validations = combine(
      nonEmpty(cmd.title, "Title"),
      nonEmpty(cmd.description, "Description"),
      nonEmpty(cmd.id_creator, "Creator Id"),
      nonEmpty(cmd.location, "Location"),
      futureDate(cmd.date, "Date")
    )
    validations.map(_ => cmd)

object GetEventValidator extends Validator[GetEventCommand]:

  override def validate(cmd: GetEventCommand): Either[List[String], GetEventCommand] =
    combine(
      nonEmpty(cmd.id_event, "Event ID")
    ).map(_ => cmd)

object UpdateEventPosterValidator extends Validator[UpdateEventPosterCommand]:

  override def validate(cmd: UpdateEventPosterCommand): Either[List[String], UpdateEventPosterCommand] =
    combine(
      nonEmpty(cmd.eventId, "Event ID"),
      nonEmpty(cmd.posterUrl, "Poster URL")
    ).map(_ => cmd)
