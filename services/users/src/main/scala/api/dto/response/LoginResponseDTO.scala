package api.dto.response

import api.dto.response.AccountDTO
import api.dto.response.ProfileDTO
import io.circe.Encoder
import io.circe.generic.semiauto._

case class LoginResponseDTO(
    accessToken: String,
    expiresIn: Long,
    refreshToken: String,
    refreshExpiresIn: Long,
    role: String,
    account: AccountDTO,
    profile: ProfileDTO
)

object LoginResponseDTO:
  import AccountDTO.given
  import ProfileDTO.given
  given Encoder[LoginResponseDTO] = deriveEncoder
