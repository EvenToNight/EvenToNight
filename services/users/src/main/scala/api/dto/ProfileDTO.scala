package api.dto

import io.circe.Encoder
import io.circe.generic.semiauto._

case class ProfileDTO(
    name: String,
    avatar: String,
    bio: Option[String],
    contacts: Option[List[String]]
)

object ProfileDTO:
  given Encoder[ProfileDTO] = deriveEncoder[ProfileDTO].mapJson(_.dropNullValues)
