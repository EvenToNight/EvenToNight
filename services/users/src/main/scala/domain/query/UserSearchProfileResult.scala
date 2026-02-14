package domain.query

import io.circe.Encoder
import io.circe.generic.semiauto._

case class UserSearchProfileResult(
    name: String,
    avatar: String,
    bio: Option[String]
)

object UserSearchProfileResult:
  given Encoder[UserSearchProfileResult] = deriveEncoder[UserSearchProfileResult].mapJson(_.dropNullValues)
