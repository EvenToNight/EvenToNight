package api.dto.request

import io.circe.Decoder
import io.circe.generic.semiauto._

case class UpdatePasswordRequestDTO(
    currentPassword: String,
    newPassword: String,
    confirmPassword: String
)

object UpdatePasswordRequestDTO:
  given Decoder[UpdatePasswordRequestDTO] = deriveDecoder
