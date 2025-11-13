package unit

import com.mongodb.client.MongoCollection
import fixtures.MemberFixtures.member
import fixtures.OrganizationFixtures.organization
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.AccountProfileRepository
import repository.MongoAccountProfileRepository

class MongoAccountProfileRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  "insert" should "delegate inserting a member's account and profile to the respective Mongo collections" in:
    val memberAccountsCollMock: MongoCollection[MemberAccount] = mock(classOf[MongoCollection[MemberAccount]])
    val memberProfilesCollMock: MongoCollection[MemberProfile] = mock(classOf[MongoCollection[MemberProfile]])
    val memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile] =
      new MongoAccountProfileRepository(memberAccountsCollMock, memberProfilesCollMock)
    memberAccountProfileRepo.insert(member.account, member.profile)
    verify(memberAccountsCollMock).insertOne(member.account)
    verify(memberProfilesCollMock).insertOne(member.profile)

  "insert" should "delegate inserting an organization's account and profile to the respective Mongo collections" in:
    val orgAccountsCollMock: MongoCollection[OrganizationAccount] = mock(classOf[MongoCollection[OrganizationAccount]])
    val orgProfilesCollMock: MongoCollection[OrganizationProfile] = mock(classOf[MongoCollection[OrganizationProfile]])
    val orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
      new MongoAccountProfileRepository(orgAccountsCollMock, orgProfilesCollMock)
    orgAccountProfileRepo.insert(organization.account, organization.profile)
    verify(orgAccountsCollMock).insertOne(organization.account)
    verify(orgProfilesCollMock).insertOne(organization.profile)
