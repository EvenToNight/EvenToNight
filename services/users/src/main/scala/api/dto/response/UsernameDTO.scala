package api.dto.response

import io.circe.Encoder
import io.circe.generic.semiauto._

case class UsernameDTO(username: String)

object UsernameDTO:
  given Encoder[UsernameDTO] = deriveEncoder[UsernameDTO]
