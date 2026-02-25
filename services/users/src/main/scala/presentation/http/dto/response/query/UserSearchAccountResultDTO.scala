package presentation.http.dto.response.query

import io.circe.Encoder
import io.circe.generic.semiauto._

case class UserSearchAccountResultDTO(
    username: String
)

object UserSearchAccountResultDTO:
  given Encoder[UserSearchAccountResultDTO] = deriveEncoder[UserSearchAccountResultDTO]
