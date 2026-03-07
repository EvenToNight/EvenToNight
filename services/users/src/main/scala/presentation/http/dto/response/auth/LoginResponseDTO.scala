package presentation.http.dto.response.auth

import io.circe.Encoder
import io.circe.generic.semiauto._
import presentation.http.dto.response.user.AccountDTO
import presentation.http.dto.response.user.ProfileDTO

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
