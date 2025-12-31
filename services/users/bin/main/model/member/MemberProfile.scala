package model.member

case class MemberProfile(nickname: String)

object MemberProfile:
  val default: MemberProfile = MemberProfile(nickname = "")
