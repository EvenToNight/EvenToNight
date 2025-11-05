package fixtures

import model.Member
import model.member.MemberAccount
import model.member.MemberProfile

object MemberFixtures:
  private val id: String        = "b07bfb2c-45f8-4f51-b6a8-c29d7895f53d"
  private val email: String     = "bobsmith@test.com"
  private val accountId: String = id
  private val nickname: String  = "bobo"
  val member: Member            = Member(MemberAccount(id, email), MemberProfile(accountId, nickname))
