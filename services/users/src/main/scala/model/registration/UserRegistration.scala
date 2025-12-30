package model.registration

import cask.model.Request
import model.Member
import model.Organization
import model.RegisteredUser
import model.ValidRegistration
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import model.registration.RegistrationRequest
import ujson.IncompleteParseException
import ujson.ParseException
import upickle.core.AbortException
import upickle.default.read

object UserRegistration:
  def parseInput(request: Request): Either[String, RegistrationRequest] =
    try Right(read[RegistrationRequest](request.text()))
    catch
      case _: ParseException | _: IncompleteParseException | _: AbortException => Left("Invalid JSON")

  private def validateUserType(request: RegistrationRequest): Either[String, Unit] =
    request.userType match
      case Some("member") | Some("organization") => Right(())
      case _                                     => Left(s"Invalid user type: ${request.userType.get}")

  def validateRegistrationRequest(request: RegistrationRequest): Either[String, ValidRegistration] =
    for
      username <- request.username.toRight("Username is missing")
      email    <- request.email.toRight("Email is missing")
      password <- request.password.toRight("Password is missing")
      userType <- request.userType.toRight("User type is missing")
      _        <- validateUserType(request)
    yield ValidRegistration(username, email, password, userType)

  def fromValidRegistration(valid: ValidRegistration, keycloakId: String): RegisteredUser =
    valid.userType match
      case "member" =>
        val memberAccount = MemberAccount(keycloakId, valid.email)
        val memberProfile = MemberProfile.default
        Member(memberAccount, memberProfile)
      case "organization" =>
        val organizationAccount = OrganizationAccount(keycloakId, valid.email)
        val organizationProfile = OrganizationProfile.default
        Organization(organizationAccount, organizationProfile)
