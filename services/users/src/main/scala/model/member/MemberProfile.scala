package model.member

import infrastructure.Wiring.mediaBaseUrl
import io.circe.Encoder
import io.circe.generic.semiauto._

case class MemberProfile(
    name: String,
    avatar: String = s"http://${mediaBaseUrl}/users/default.png",
    bio: Option[String] = None
)

object MemberProfile:
  given Encoder[MemberProfile] = deriveEncoder[MemberProfile].mapJson(_.dropNullValues)
