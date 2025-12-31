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

  def getUsers(): Either[String, List[RegisteredUser]] =
    val members                     = memberRepo.getAllMembers().toList
    val organizations               = orgRepo.getAllOrganizations().toList
    val users: List[RegisteredUser] = members ++ organizations
    if users.isEmpty then
      Left("No users found")
    else
      Right(users)

  def getUserById(userId: String): Either[String, RegisteredUser] =
    memberRepo.findById(userId) match
      case Some(member) => Right(member)
      case None =>
        orgRepo.findById(userId) match
          case Some(org) => Right(org)
          case None      => Left(s"User with ID $userId not found")
