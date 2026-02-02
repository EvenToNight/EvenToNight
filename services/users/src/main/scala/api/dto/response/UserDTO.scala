package api.dto.response

import api.dto.response.ProfileDTO
import io.circe.Encoder
import io.circe.generic.semiauto._

case class UserDTO(id: String, role: String, account: UsernameDTO, profile: ProfileDTO)

object UserDTO:
  import UsernameDTO.given
  import ProfileDTO.given
  given Encoder[UserDTO] = deriveEncoder
