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

  private def validateRole(request: RegistrationRequest): Either[String, Unit] =
    request.role match
      case Some("member") | Some("organization") => Right(())
      case _                                     => Left(s"Invalid role: ${request.role.get}")

  def validateRegistrationRequest(request: RegistrationRequest): Either[String, ValidRegistration] =
    for
      username <- request.username.toRight("Username is missing")
      email    <- request.email.toRight("Email is missing")
      password <- request.password.toRight("Password is missing")
      role     <- request.role.toRight("Role is missing")
      _        <- validateRole(request)
    yield ValidRegistration(username, email, password, role)

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
