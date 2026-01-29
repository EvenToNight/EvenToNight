package api.dto.request

import io.circe.Decoder
import io.circe.DecodingFailure
import io.circe.HCursor

case class UpdateProfileDTO(
    name: String,
    bio: Option[String] = None,
    contacts: Option[List[String]] = None
)

object UpdateProfileDTO:
  given Decoder[UpdateProfileDTO] with
    def apply(c: HCursor): Either[DecodingFailure, UpdateProfileDTO] =
      for
        name <- c.downField("name").as[Option[String]].flatMap {
          case Some(value) => Right(value)
          case None        => Left(DecodingFailure("Missing required field: name", c.history))
        }
        bio      <- c.downField("bio").as[Option[String]]
        contacts <- c.downField("contacts").as[Option[List[String]]]
      yield UpdateProfileDTO(name, bio, contacts)
