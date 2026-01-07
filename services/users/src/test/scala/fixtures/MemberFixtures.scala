package fixtures

import model.Member
import model.member.MemberAccount
import model.member.MemberProfile

object MemberFixtures:
  val memberUserId: String       = "6f1c3d9a-2a44-4f2e-b7e9-8c5b6a3f9c12"
  private val keycloakId: String = "b07bfb2c-45f8-4f51-b6a8-c29d7895f53d"
  private val username: String   = "bobo"
  private val email: String      = "bobsmith@test.com"
  private val name: String       = "Bob Smith"
  val member: Member             = Member(MemberAccount(keycloakId, username, email), MemberProfile(name))
