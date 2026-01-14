package api.dto

import io.circe.Encoder
import io.circe.generic.semiauto._

case class ProfileDTO(name: String)

object ProfileDTO:
  given Encoder[ProfileDTO] = deriveEncoder
