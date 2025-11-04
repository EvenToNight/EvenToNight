package model

import member.{MemberAccount, MemberProfile}

sealed trait RegisteredUser

case class Member(account: MemberAccount, profile: MemberProfile) extends RegisteredUser
