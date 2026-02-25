package presentation.http.dto.response.query

import domain.valueobjects.UserRole
import io.circe.Encoder
import io.circe.generic.semiauto._

case class UserSearchResultDTO(
    id: String,
    role: UserRole,
    account: UserSearchAccountResultDTO,
    profile: UserSearchProfileResultDTO
)

object UserSearchResult:
  import UserSearchAccountResultDTO.given
  import UserSearchProfileResultDTO.given
  given Encoder[UserSearchResultDTO] = deriveEncoder[UserSearchResultDTO]
