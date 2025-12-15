package domain.commands.validators
import domain.commands.{
  CreateEventCommand,
  DeleteEventCommand,
  GetEventCommand,
  GetFilteredEventsCommand,
  UpdateEventCommand,
  UpdateEventPosterCommand
}
import domain.models.{EventStatus, Location}

import java.time.LocalDateTime

import ValidationRules.{futureDate, nonEmpty, correctLocality, positiveInt, nonNegativeInt, dateRange, priceRange}
import Validator.combine

object CreateEventValidator extends Validator[CreateEventCommand]:

  override def validate(cmd: CreateEventCommand): Either[List[String], CreateEventCommand] =
    cmd.status match
      case EventStatus.DRAFT =>
        val validations = combine(
          nonEmpty(cmd.id_creator, "Creator Id")
        )
        validations.map(_ => cmd)
      case _ =>
        val validations = combine(
          nonEmpty(cmd.title.getOrElse(""), "Title"),
          nonEmpty(cmd.description.getOrElse(""), "Description"),
          nonEmpty(cmd.price.getOrElse(0).toString(), "Price"),
          nonEmpty(cmd.id_creator, "Creator Id"),
          correctLocality(cmd.location.getOrElse(Location.Nil()), "Location"),
          futureDate(cmd.date.getOrElse(LocalDateTime.now()), "Date")
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
    cmd.status match
      case EventStatus.DRAFT =>
        val validations = combine(
          nonEmpty(cmd.id_event, "Event ID")
        )
        validations.map(_ => cmd)
      case _ =>
        val validations = combine(
          nonEmpty(cmd.id_event, "Event ID"),
          nonEmpty(cmd.title.getOrElse(""), "Title"),
          nonEmpty(cmd.description.getOrElse(""), "Description"),
          nonEmpty(cmd.price.getOrElse("").toString(), "Price"),
          correctLocality(cmd.location.getOrElse(Location.Nil()), "Location"),
          futureDate(cmd.date.getOrElse(LocalDateTime.now()), "Date")
        )
        validations.map(_ => cmd)

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
      dateRange(cmd.startDate, cmd.endDate, "Date range"),
      priceRange(cmd.priceRange, "Price range")
    ).map(_ => cmd)
