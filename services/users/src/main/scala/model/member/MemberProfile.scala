package model.member

import infrastructure.Wiring.mediaBaseUrl

case class MemberProfile(
    name: String,
    avatar: String = s"http://${mediaBaseUrl}/users/default.png",
    bio: Option[String] = None
)
