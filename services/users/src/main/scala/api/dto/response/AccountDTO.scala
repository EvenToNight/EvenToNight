package api.dto.response

import io.circe.Encoder
import io.circe.generic.semiauto._
import model.member.Gender

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
