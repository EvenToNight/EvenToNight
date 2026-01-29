package model.query

import io.circe.Encoder
import io.circe.generic.semiauto._

case class UserSearchAccountResult(
    username: String
)

object UserSearchAccountResult:
  given Encoder[UserSearchAccountResult] = deriveEncoder[UserSearchAccountResult]
