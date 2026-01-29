package model.query

import io.circe.Encoder
import io.circe.generic.semiauto._
import model.UserRole

case class UserSearchResult(
    id: String,
    role: UserRole,
    account: UserSearchAccountResult,
    profile: UserSearchProfileResult
)

object UserSearchResult:
  import UserSearchAccountResult.given
  import UserSearchProfileResult.given
  given Encoder[UserSearchResult] = deriveEncoder[UserSearchResult]
