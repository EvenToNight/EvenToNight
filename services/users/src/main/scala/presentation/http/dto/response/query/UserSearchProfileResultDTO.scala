package presentation.http.dto.response.query

import io.circe.Encoder
import io.circe.generic.semiauto._

case class UserSearchProfileResultDTO(
    name: String,
    avatar: String,
    bio: Option[String]
)

object UserSearchProfileResultDTO:
  given Encoder[UserSearchProfileResultDTO] = deriveEncoder[UserSearchProfileResultDTO].mapJson(_.dropNullValues)
