package model.member

case class MemberProfile(
    name: String,
    avatar: String = "",
    bio: Option[String] = None
)
