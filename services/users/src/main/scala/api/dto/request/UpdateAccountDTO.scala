package api.dto.request

import io.circe.Decoder
import io.circe.DecodingFailure
import io.circe.HCursor
import io.circe.generic.semiauto._

import java.time.Instant

case class UpdateAccountDTO(
    darkMode: Option[Boolean] = None,
    language: Option[String] = None,
    gender: Option[String] = None,
    birthDate: Option[Instant] = None,
    interests: Option[List[String]] = None
)

object UpdateAccountDTO:
  given instantDecoder: Decoder[Instant] with
    def apply(c: HCursor): Either[DecodingFailure, Instant] =
      c.as[String].flatMap(str =>
        try Right(Instant.parse(str))
        catch case _: Exception => Left(DecodingFailure(s"Invalid Instant: $str", c.history))
      )
  given Decoder[UpdateAccountDTO] = deriveDecoder
