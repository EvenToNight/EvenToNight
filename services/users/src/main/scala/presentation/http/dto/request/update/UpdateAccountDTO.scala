package presentation.http.dto.request.update

import domain.valueobjects.member.Gender
import io.circe.Decoder
import io.circe.DecodingFailure
import io.circe.HCursor

import java.time.Instant

case class UpdateAccountDTO(
    darkMode: Boolean,
    language: String,
    gender: Option[Gender] = None,
    birthDate: Option[Instant] = None,
    interests: Option[List[String]] = None
)

object UpdateAccountDTO:
  import Gender.given
  given instantDecoder: Decoder[Instant] with
    override def apply(c: HCursor): Either[DecodingFailure, Instant] =
      c.as[String].flatMap(str =>
        try Right(Instant.parse(str))
        catch case _: Exception => Left(DecodingFailure(s"Invalid Instant: $str", c.history))
      )
  given Decoder[UpdateAccountDTO] with
    override def apply(c: HCursor): Either[DecodingFailure, UpdateAccountDTO] =
      for
        darkMode <- c.downField("darkMode").as[Option[Boolean]].flatMap {
          case Some(value) => Right(value)
          case None        => Left(DecodingFailure("Missing required field: darkMode", c.history))
        }
        language <- c.downField("language").as[Option[String]].flatMap {
          case Some(value) => Right(value)
          case None        => Left(DecodingFailure("Missing required field: language", c.history))
        }
        gender    <- c.downField("gender").as[Option[Gender]]
        birthDate <- c.downField("birthDate").as[Option[Instant]]
        interests <- c.downField("interests").as[Option[List[String]]]
      yield UpdateAccountDTO(darkMode, language, gender, birthDate, interests)
