package api.dto.response

import api.dto.response.ProfileDTO
import io.circe.Encoder
import io.circe.generic.semiauto._

case class UserDTO(id: String, username: String, role: String, profile: ProfileDTO)

object UserDTO:
  import ProfileDTO.given
  given Encoder[UserDTO] = deriveEncoder
