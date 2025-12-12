package domain.commands.validators

import domain.commands.{
  CreateEventCommand,
  DeleteEventCommand,
  GetEventCommand,
  GetFilteredEventsCommand,
  UpdateEventCommand,
  UpdateEventPosterCommand
}
import domain.models.EventStatus

import ValidationRules.{futureDate, nonEmpty, correctLocality, positiveInt, nonNegativeInt, dateRange}
import Validator.combine

object CreateEventValidator extends Validator[CreateEventCommand]:

  override def validate(cmd: CreateEventCommand): Either[List[String], CreateEventCommand] =
    cmd.status match
      case EventStatus.DRAFT =>
        Right(cmd)
      case _ =>
        val validations = combine(
          nonEmpty(cmd.title, "Title"),
          nonEmpty(cmd.description, "Description"),
          nonEmpty(cmd.id_creator, "Creator Id"),
          correctLocality(cmd.location, "Location"),
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
      nonEmpty(cmd.id_event, "Event ID"),
      nonEmpty(cmd.posterUrl, "Poster URL")
    ).map(_ => cmd)

object UpdateEventValidator extends Validator[UpdateEventCommand]:
  override def validate(cmd: UpdateEventCommand): Either[List[String], UpdateEventCommand] =
    combine(
      nonEmpty(cmd.id_event, "Event ID")
    ).map(_ => cmd)

object DeleteEventValidator extends Validator[DeleteEventCommand]:
  override def validate(cmd: DeleteEventCommand): Either[List[String], DeleteEventCommand] =
    combine(
      nonEmpty(cmd.id_event, "Event ID")
    ).map(_ => cmd)

object GetFilteredEventsValidator extends Validator[GetFilteredEventsCommand]:
  override def validate(cmd: GetFilteredEventsCommand): Either[List[String], GetFilteredEventsCommand] =
    combine(
      positiveInt(cmd.limit, "Limit"),
      nonNegativeInt(cmd.offset, "Offset"),
      dateRange(cmd.startDate, cmd.endDate, "Date range")
    ).map(_ => cmd)
