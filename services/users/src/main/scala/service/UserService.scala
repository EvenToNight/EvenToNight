package service

import model.Member
import model.RegisteredUser
import repository.MemberRepository

class UserService(memberRepo: MemberRepository):
  def insertUser(user: RegisteredUser): Unit =
    user match
      case m: Member => memberRepo.insert(m)
