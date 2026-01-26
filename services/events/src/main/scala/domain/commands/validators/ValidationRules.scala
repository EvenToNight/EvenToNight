package domain.commands.validators

import domain.models.Location

import java.time.LocalDateTime

object ValidationRules:

  def nonEmpty(str: String, field: String): Either[String, String] =
    Either.cond(str.trim.nonEmpty, str, s"$field cannot be empty")

  def futureDate(date: LocalDateTime, field: String = "Date"): Either[String, LocalDateTime] =
    Either.cond(date.isAfter(LocalDateTime.now()), date, s"$field must be in the future")

  def correctLocality(
      locality: Location,
      field: String = "Location"
  ): Either[String, Location] =
    val latitude         = locality.lat.getOrElse(0.0)
    val longitude        = locality.lon.getOrElse(0.0)
    val isValidLatitude  = latitude >= -90 && latitude <= 90
    val isValidLongitude = longitude >= -180 && longitude <= 180
    Either.cond(
      isValidLatitude &&
        isValidLongitude &&
        nonEmpty(locality.country.getOrElse(""), "Country").isRight &&
        nonEmpty(locality.country_code.getOrElse(""), "Country Code").isRight &&
        nonEmpty(locality.road.getOrElse(""), "Road").isRight &&
        nonEmpty(locality.postcode.getOrElse(""), "Postcode").isRight,
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
