package domain.commands.validators

import java.time.LocalDateTime

object ValidationRules:

  def nonEmpty(str: String, field: String): Either[String, String] =
    Either.cond(str.trim.nonEmpty, str, s"$field cannot be empty")

  def futureDate(date: LocalDateTime, field: String = "Date"): Either[String, LocalDateTime] =
    Either.cond(date.isAfter(LocalDateTime.now()), date, s"$field must be in the future")
