package api.dto.request

import io.circe.Decoder
import io.circe.generic.semiauto._

case class UpdateProfileDTO(
    name: Option[String] = None,
    bio: Option[String] = None,
    contacts: Option[List[String]] = None
)

object UpdateProfileDTO:
  given Decoder[UpdateProfileDTO] = deriveDecoder
