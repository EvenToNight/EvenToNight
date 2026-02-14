package domain.query

import domain.UserRole
import io.circe.Encoder
import io.circe.generic.semiauto._

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
