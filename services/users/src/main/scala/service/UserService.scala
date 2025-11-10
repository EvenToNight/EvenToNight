package service

import model.Member
import model.Organization
import model.RegisteredUser
import repository.MemberRepository
import repository.OrganizationRepository

class UserService(memberRepo: MemberRepository, orgRepo: OrganizationRepository):
  def insertUser(user: RegisteredUser): Unit =
    user match
      case m: Member       => memberRepo.insert(m)
      case o: Organization => orgRepo.insert(o)
