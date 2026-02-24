package application.registration

import application.registration.ValidRegistration
import domain.aggregates.Member
import domain.aggregates.Organization
import domain.aggregates.RegisteredUser
import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile
import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile

object RegisteredUserFactory:
  def fromValidRegistration(valid: ValidRegistration): RegisteredUser =
    valid.role match
      case "member" =>
        val memberAccount = MemberAccount(valid.username, valid.email)
        val memberProfile = MemberProfile(valid.username)
        Member(memberAccount, memberProfile)
      case "organization" =>
        val organizationAccount = OrganizationAccount(valid.username, valid.email)
        val organizationProfile = OrganizationProfile(valid.username)
        Organization(organizationAccount, organizationProfile)
