package model.query

import io.circe.Encoder
import io.circe.generic.semiauto._
import model.UserRole

case class UserSearchResult(
    username: String,
    name: String,
    avatar: String,
    bio: Option[String],
    role: UserRole
)

object UserSearchResult:
  given Encoder[UserSearchResult] = deriveEncoder[UserSearchResult].mapJson(_.dropNullValues)
