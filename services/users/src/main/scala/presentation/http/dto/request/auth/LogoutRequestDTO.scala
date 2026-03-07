package presentation.http.dto.request.auth

import io.circe.Decoder
import io.circe.generic.semiauto._

case class LogoutRequestDTO(refreshToken: String)

object LogoutRequestDTO:
  given Decoder[LogoutRequestDTO] = deriveDecoder
