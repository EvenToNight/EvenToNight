package model.member

import java.time.Instant

case class MemberAccount(
    username: String,
    email: String,
    darkMode: Boolean = false,
    language: String = "EN",
    gender: Option[String] = None,
    birthDate: Option[Instant] = None,
    interests: Option[List[String]] = None
)
