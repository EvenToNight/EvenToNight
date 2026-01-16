package api.dto

import io.circe.Encoder
import io.circe.generic.semiauto._

case class TokensDTO(accessToken: String, expiresIn: Long, refreshToken: String, refreshExpiresIn: Long)

object TokensDTO:
  given Encoder[TokensDTO] = deriveEncoder
