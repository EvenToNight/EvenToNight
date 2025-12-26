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
