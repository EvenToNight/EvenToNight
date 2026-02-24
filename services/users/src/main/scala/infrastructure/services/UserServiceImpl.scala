package infrastructure.services

import domain.aggregates.Member
import domain.aggregates.Organization
import domain.aggregates.RegisteredUser
import domain.repository.MemberRepository
import domain.repository.OrganizationRepository
import domain.service.UserService

class UserServiceImpl(memberRepo: MemberRepository, orgRepo: OrganizationRepository) extends UserService:
  override def insertUser(user: RegisteredUser, userId: String) =
    user match
      case m: Member =>
        try
          memberRepo.insert(m, userId)
          Right(())
        catch
          case e: Exception => Left(s"Failed to insert member: ${e.getMessage}")
      case o: Organization =>
        try
          orgRepo.insert(o, userId)
          Right(())
        catch
          case e: Exception => Left(s"Failed to insert organization: ${e.getMessage}")

  override def getUsers() =
    val members       = memberRepo.getAllMembers().toList.map(m => ("member", m._1, m._2))
    val organizations = orgRepo.getAllOrganizations().toList.map(o => ("organization", o._1, o._2))
    val users         = members ++ organizations
    if users.isEmpty then
      Left("No users found")
    else
      Right(users)

  override def getUserById(userId: String) =
    memberRepo.findById(userId) match
      case Some(member) => Right("member", member)
      case None =>
        orgRepo.findById(userId) match
          case Some(org) => Right("organization", org)
          case None      => Left(s"User with ID $userId not found")

  override def deleteUser(userId: String) =
    memberRepo.findById(userId) match
      case Some(_) => Right(memberRepo.delete(userId))
      case None =>
        orgRepo.findById(userId) match
          case Some(_) => Right(orgRepo.delete(userId))
          case None    => Left(s"User with ID $userId not found")

  override def updateUser(updatedUser: RegisteredUser, userId: String) =
    updatedUser match
      case updatedMember: Member =>
        memberRepo.findById(userId) match
          case Some(_) =>
            try
              memberRepo.update(updatedMember, userId)
              Right(())
            catch
              case e: Exception => Left(s"Failed to update member: ${e.getMessage}")
          case None => Left(s"Member with ID $userId not found")
      case updatedOrganization: Organization =>
        orgRepo.findById(userId) match
          case Some(_) =>
            try
              orgRepo.update(updatedOrganization, userId)
              Right(())
            catch
              case e: Exception => Left(s"Failed to update organization: ${e.getMessage}")
          case None => Left(s"Organization with ID $userId not found")

  override def updateAvatar(userId: String, avatar: String) =
    memberRepo.updateAvatar(userId, avatar) match
      case Some(member) => Right(member)
      case None =>
        orgRepo.updateAvatar(userId, avatar) match
          case Some(organization) => Right(organization)
          case None               => Left(s"User with ID $userId not found")
