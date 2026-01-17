package service

import model.Member
import model.Organization
import model.RegisteredUser
import repository.MemberRepository
import repository.OrganizationRepository

class UserService(memberRepo: MemberRepository, orgRepo: OrganizationRepository):
  def insertUser(user: RegisteredUser, userId: String): String =
    user match
      case m: Member       => memberRepo.insert(m, userId)
      case o: Organization => orgRepo.insert(o, userId)

  def getUsers(): Either[String, List[(String, RegisteredUser)]] =
    val members       = memberRepo.getAllMembers().toList.map(m => ("member", m))
    val organizations = orgRepo.getAllOrganizations().toList.map(o => ("organization", o))
    val users         = members ++ organizations
    if users.isEmpty then
      Left("No users found")
    else
      Right(users)

  def getUserById(userId: String): Either[String, (String, RegisteredUser)] =
    memberRepo.findById(userId) match
      case Some(member) => Right("member", member)
      case None =>
        orgRepo.findById(userId) match
          case Some(org) => Right("organization", org)
          case None      => Left(s"User with ID $userId not found")

  def deleteUser(userId: String): Either[String, Unit] =
    memberRepo.findById(userId) match
      case Some(_) => Right(memberRepo.delete(userId))
      case None =>
        orgRepo.findById(userId) match
          case Some(_) => Right(orgRepo.delete(userId))
          case None    => Left(s"User with ID $userId not found")
