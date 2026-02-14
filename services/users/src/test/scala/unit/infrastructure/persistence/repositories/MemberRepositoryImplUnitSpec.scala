package unit.infrastructure.persistence.repositories

import domain.repository.AccountProfileRepository
import domain.repository.MemberRepository
import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile
import fixtures.MemberFixtures.member
import fixtures.MemberFixtures.memberUserId
import infrastructure.persistence.repositories.MemberRepositoryImpl
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class MemberRepositoryImplUnitSpec extends AnyFlatSpec with Matchers:
  "insert" should "delegate member's account and profile insertion to the member account-profile repository" in:
    val memberAccountProfileRepoMock: AccountProfileRepository[MemberAccount, MemberProfile] =
      mock(classOf[AccountProfileRepository[MemberAccount, MemberProfile]])
    val memberRepo: MemberRepository = new MemberRepositoryImpl(memberAccountProfileRepoMock)
    memberRepo.insert(member, memberUserId)
    verify(memberAccountProfileRepoMock).insert(member.account, member.profile, memberUserId)
