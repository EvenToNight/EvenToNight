package domain.commands.validators

import domain.commands.CreateEventDraftCommand

object CreateEventDraftValidator extends Validator[CreateEventDraftCommand]:

  private def nonEmpty(str: String, field: String): Either[String, String] =
    if str.nonEmpty then Right(str) else Left(s"$field cannot be empty")

  private def futureDate(d: java.time.LocalDateTime): Either[String, java.time.LocalDateTime] =
    if d.isAfter(java.time.LocalDateTime.now()) then Right(d)
    else Left("Date must be in the future")

  override def validate(cmd: CreateEventDraftCommand): Either[List[String], CreateEventDraftCommand] =
    val validations = List(
      nonEmpty(cmd.title, "Title"),
      nonEmpty(cmd.description, "Description"),
      nonEmpty(cmd.location, "Location"),
      futureDate(cmd.date).map(_ => "")
    )

    val errors = validations.collect { case Left(error) => error }
    if errors.isEmpty then Right(cmd)
    else Left(errors)
