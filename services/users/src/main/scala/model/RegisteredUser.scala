package model

import member.{MemberAccount, MemberProfile}
import organization.{OrganizationAccount, OrganizationProfile}

sealed trait RegisteredUser

case class Member(account: MemberAccount, profile: MemberProfile) extends RegisteredUser

case class Organization(account: OrganizationAccount, profile: OrganizationProfile) extends RegisteredUser
