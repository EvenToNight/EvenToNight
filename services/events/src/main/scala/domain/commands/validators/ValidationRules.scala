package domain.commands.validators

import java.time.LocalDateTime

object ValidationRules:

  def nonEmpty(str: String, field: String): Either[String, String] =
    Either.cond(str.trim.nonEmpty, str, s"$field cannot be empty")

  def futureDate(date: LocalDateTime, field: String = "Date"): Either[String, LocalDateTime] =
    Either.cond(date.isAfter(LocalDateTime.now()), date, s"$field must be in the future")

  def correctLocality(
      locality: domain.models.Location,
      field: String = "Location"
  ): Either[String, domain.models.Location] =
    val isValidLatitude  = locality.lat >= -90 && locality.lat <= 90
    val isValidLongitude = locality.lon >= -180 && locality.lon <= 180
    Either.cond(
      isValidLatitude &&
        isValidLongitude &&
        nonEmpty(locality.country, "Country").isRight &&
        nonEmpty(locality.country_code, "Country Code").isRight &&
        nonEmpty(locality.road, "Road").isRight &&
        nonEmpty(locality.postcode, "Postcode").isRight,
      locality,
      s"$field has invalid parameters"
    )

  def positiveInt(value: Option[Int], fieldName: String): Either[String, Unit] =
    value match
      case Some(v) if v <= 0 => Left(s"$fieldName must be positive")
      case _                 => Right(())

  def nonNegativeInt(value: Option[Int], fieldName: String): Either[String, Unit] =
    value match
      case Some(v) if v < 0 => Left(s"$fieldName cannot be negative")
      case _                => Right(())

  def dateRange(
      startDate: Option[LocalDateTime],
      endDate: Option[LocalDateTime],
      fieldName: String
  ): Either[String, Unit] =
    (startDate, endDate) match
      case (Some(start), Some(end)) if start.isAfter(end) =>
        Left(s"$fieldName: start date must be before end date")
      case _ => Right(())
