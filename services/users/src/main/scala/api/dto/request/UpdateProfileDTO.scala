package api.dto.request

import io.circe.Decoder
import io.circe.DecodingFailure
import io.circe.HCursor
import model.organization.UrlString

case class UpdateProfileDTO(
    name: String,
    bio: Option[String] = None,
    contacts: Option[List[UrlString]] = None
)

object UpdateProfileDTO:
  import UrlString.given
  given Decoder[UpdateProfileDTO] with
    override def apply(c: HCursor): Either[DecodingFailure, UpdateProfileDTO] =
      for
        name <- c.downField("name").as[Option[String]].flatMap {
          case Some(value) => Right(value)
          case None        => Left(DecodingFailure("Missing required field: name", c.history))
        }
        bio      <- c.downField("bio").as[Option[String]]
        contacts <- c.downField("contacts").as[Option[List[UrlString]]]
      yield UpdateProfileDTO(name, bio, contacts)
