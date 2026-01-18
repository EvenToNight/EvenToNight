package model.member

import io.circe.Encoder
import io.circe.generic.semiauto._

import java.time.Instant

case class MemberAccount(
    username: String,
    email: String,
    darkMode: Boolean = false,
    language: String = "en",
    gender: Option[String] = None,
    birthDate: Option[Instant] = None,
    interests: Option[List[String]] = None
)

object MemberAccount:
  given Encoder[MemberAccount] = deriveEncoder[MemberAccount].mapJson(_.dropNullValues)
