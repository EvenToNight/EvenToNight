package presentation.http.dto.request.auth

import io.circe.Decoder
import io.circe.generic.semiauto._

case class RefreshRequestDTO(refreshToken: String)

object RefreshRequestDTO:
  given Decoder[RefreshRequestDTO] = deriveDecoder
