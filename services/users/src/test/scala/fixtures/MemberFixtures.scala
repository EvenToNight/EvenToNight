package fixtures

import domain.aggregates.Member
import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile

object MemberFixtures:
  val memberUserId: String     = "6f1c3d9a-2a44-4f2e-b7e9-8c5b6a3f9c12"
  private val username: String = "bobo"
  private val email: String    = "bobsmith@test.com"
  private val name: String     = "Bob Smith"
  val member: Member           = Member(MemberAccount(username, email), MemberProfile(name))
