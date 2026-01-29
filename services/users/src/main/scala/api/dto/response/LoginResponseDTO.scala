package api.dto.response

import api.dto.response.AccountDTO
import api.dto.response.ProfileDTO
import io.circe.Encoder
import io.circe.generic.semiauto._

case class LoginResponseDTO(
    id: String,
    role: String,
    account: AccountDTO,
    profile: ProfileDTO,
    accessToken: String,
    expiresIn: Long,
    refreshToken: String,
    refreshExpiresIn: Long
)

object LoginResponseDTO:
  import AccountDTO.given
  import ProfileDTO.given
  given Encoder[LoginResponseDTO] = deriveEncoder
