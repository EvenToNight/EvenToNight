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
        nonEmpty(locality.postcode, "Postcode").isRight &&
        nonEmpty(locality.house_number, "House Number").isRight,
      locality,
      s"$field has invalid parameters"
    )
