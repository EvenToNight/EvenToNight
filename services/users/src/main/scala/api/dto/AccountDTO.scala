package api.dto

import io.circe.Encoder
import io.circe.generic.semiauto._

case class AccountDTO(username: String, email: String)

object AccountDTO:
  given Encoder[AccountDTO] = deriveEncoder
