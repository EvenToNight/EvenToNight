package domain.aggregates

import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile
import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile

sealed trait RegisteredUser

case class Member(account: MemberAccount, profile: MemberProfile) extends RegisteredUser

case class Organization(account: OrganizationAccount, profile: OrganizationProfile) extends RegisteredUser
