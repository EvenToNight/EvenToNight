package unit.repository

import fixtures.MemberFixtures.member
import fixtures.MemberFixtures.memberUserId
import model.member.MemberAccount
import model.member.MemberProfile
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.AccountProfileRepository
import repository.MemberRepository
import repository.MongoMemberRepository

class MongoMemberRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  "insert" should "delegate member's account and profile insertion to the member account-profile repository" in:
    val memberAccountProfileRepoMock: AccountProfileRepository[MemberAccount, MemberProfile] =
      mock(classOf[AccountProfileRepository[MemberAccount, MemberProfile]])
    val memberRepo: MemberRepository = new MongoMemberRepository(memberAccountProfileRepoMock)
    memberRepo.insert(member, memberUserId)
    verify(memberAccountProfileRepoMock).insert(member.account, member.profile, memberUserId)
