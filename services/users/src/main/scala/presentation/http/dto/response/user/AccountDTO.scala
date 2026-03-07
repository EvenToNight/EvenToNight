package presentation.http.dto.response.user

import domain.valueobjects.member.Gender
import io.circe.Encoder
import io.circe.generic.semiauto._

import java.time.Instant

case class AccountDTO(
    username: String,
    email: String,
    darkMode: Boolean,
    language: String,
    gender: Option[Gender],
    birthDate: Option[Instant],
    interests: Option[List[String]]
)

object AccountDTO:
  given Encoder[AccountDTO] = deriveEncoder[AccountDTO].mapJson(_.dropNullValues)
