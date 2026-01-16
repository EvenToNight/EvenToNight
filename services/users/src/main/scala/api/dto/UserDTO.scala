package api.dto

import io.circe.Encoder
import io.circe.generic.semiauto._

case class UserDTO(username: String, role: String, profile: ProfileDTO)

object UserDTO:
  import ProfileDTO.given
  given Encoder[UserDTO] = deriveEncoder
