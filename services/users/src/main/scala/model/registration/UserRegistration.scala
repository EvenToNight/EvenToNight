package model.registration

import model.Member
import model.Organization
import model.RegisteredUser
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import model.registration.RegistrationRequest

object UserRegistration:
  def validateRegistrationRequest(request: RegistrationRequest): Either[String, Unit] =
    request.userType match
      case "member" | "organization" => Right(())
      case _                         => Left(s"Invalid user type: ${request.userType}")

  def fromRegistrationRequest(request: RegistrationRequest, keycloakId: String): RegisteredUser =
    request.userType match
      case "member" =>
        val memberAccount = MemberAccount(keycloakId, request.email)
        val memberProfile = MemberProfile.default
        Member(memberAccount, memberProfile)
      case "organization" =>
        val organizationAccount = OrganizationAccount(keycloakId, request.email)
        val organizationProfile = OrganizationProfile.default
        Organization(organizationAccount, organizationProfile)
