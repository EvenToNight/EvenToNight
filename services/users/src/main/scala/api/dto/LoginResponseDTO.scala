package api.dto

import api.dto.AccountDTO
import api.dto.ProfileDTO
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
