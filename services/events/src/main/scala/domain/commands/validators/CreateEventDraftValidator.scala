package domain.commands.validators

import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand

import java.time.LocalDateTime

object ValidationRules:
  def nonEmpty(str: String, field: String): Either[String, String] =
    if str.nonEmpty then Right(str) else Left(s"$field cannot be empty")

  def futureDate(date: LocalDateTime, field: String = "Date"): Either[String, LocalDateTime] =
    if date.isAfter(LocalDateTime.now()) then Right(date)
    else Left(s"$field must be in the future")

  def validateAll[T](validations: List[Either[String, Any]]): Either[List[String], Unit] =
    val errors = validations.collect { case Left(error) => error }
    if errors.isEmpty then Right(()) else Left(errors)

object CreateEventDraftValidator extends Validator[CreateEventDraftCommand]:
  import ValidationRules.*

  override def validate(cmd: CreateEventDraftCommand): Either[List[String], CreateEventDraftCommand] =
    val validations = List(
      nonEmpty(cmd.title, "Title"),
      nonEmpty(cmd.description, "Description"),
      nonEmpty(cmd.location, "Location"),
      nonEmpty(cmd.id_creator, "Creator Id"),
      futureDate(cmd.date)
    )

    validateAll(validations) match
      case Right(_)     => Right(cmd)
      case Left(errors) => Left(errors)

object GetEventValidator extends Validator[GetEventCommand]:
  import ValidationRules.nonEmpty

  override def validate(cmd: GetEventCommand): Either[List[String], GetEventCommand] =
    if nonEmpty(cmd.id_event, "Event ID").isLeft then
      Left(List("Event ID cannot be empty"))
    else
      Right(cmd)
