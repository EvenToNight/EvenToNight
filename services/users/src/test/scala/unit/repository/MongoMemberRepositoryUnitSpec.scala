package unit.repository

import fixtures.MemberFixtures.member
import model.member.MemberAccount
import model.member.MemberProfile
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.AccountProfileRepository
import repository.MemberRepository
import repository.MongoMemberRepository

class MongoMemberRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  "insert" should "delegate inserting a member's account and profile to the member account-profile repository" in:
    val memberAccountProfileRepoMock: AccountProfileRepository[MemberAccount, MemberProfile] =
      mock(classOf[AccountProfileRepository[MemberAccount, MemberProfile]])
    val memberRepo: MemberRepository = new MongoMemberRepository(memberAccountProfileRepoMock)
    memberRepo.insert(member)
    verify(memberAccountProfileRepoMock).insert(member.account, member.profile)
