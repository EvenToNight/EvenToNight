package unit.repository

import com.mongodb.client.MongoCollection
import com.mongodb.client.result.InsertOneResult
import fixtures.MemberFixtures.member
import fixtures.OrganizationFixtures.organization
import model.ForeignKeys
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import org.bson.BsonObjectId
import org.bson.types.ObjectId
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.AccountProfileRepository
import repository.MongoAccountProfileRepository

class MongoAccountProfileRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  private def setupMemberMocks() =
    val membersMock: MongoCollection[ForeignKeys]              = mock(classOf[MongoCollection[ForeignKeys]])
    val memberAccountsCollMock: MongoCollection[MemberAccount] = mock(classOf[MongoCollection[MemberAccount]])
    val memberProfilesCollMock: MongoCollection[MemberProfile] = mock(classOf[MongoCollection[MemberProfile]])

    val accountId     = ObjectId()
    val accountResult = mock(classOf[InsertOneResult])
    when(accountResult.getInsertedId()).thenReturn(BsonObjectId(accountId))
    when(memberAccountsCollMock.insertOne(member.account)).thenReturn(accountResult)

    val profileId     = ObjectId()
    val profileResult = mock(classOf[InsertOneResult])
    when(profileResult.getInsertedId()).thenReturn(BsonObjectId(profileId))
    when(memberProfilesCollMock.insertOne(member.profile)).thenReturn(profileResult)

    val userId            = ObjectId()
    val foreignKeysResult = mock(classOf[InsertOneResult])
    when(foreignKeysResult.getInsertedId()).thenReturn(BsonObjectId(userId))
    when(membersMock.insertOne(any[ForeignKeys])).thenReturn(foreignKeysResult)
    (
      membersMock,
      memberAccountsCollMock,
      memberProfilesCollMock,
      accountId,
      profileId
    )

  private def setupOrganizationMocks() =
    val orgsMock: MongoCollection[ForeignKeys]                    = mock(classOf[MongoCollection[ForeignKeys]])
    val orgAccountsCollMock: MongoCollection[OrganizationAccount] = mock(classOf[MongoCollection[OrganizationAccount]])
    val orgProfilesCollMock: MongoCollection[OrganizationProfile] = mock(classOf[MongoCollection[OrganizationProfile]])

    val accountId     = ObjectId()
    val accountResult = mock(classOf[InsertOneResult])
    when(accountResult.getInsertedId()).thenReturn(BsonObjectId(accountId))
    when(orgAccountsCollMock.insertOne(organization.account)).thenReturn(accountResult)

    val profileId     = ObjectId()
    val profileResult = mock(classOf[InsertOneResult])
    when(profileResult.getInsertedId()).thenReturn(BsonObjectId(profileId))
    when(orgProfilesCollMock.insertOne(organization.profile)).thenReturn(profileResult)

    val userId            = ObjectId()
    val foreignKeysResult = mock(classOf[InsertOneResult])
    when(foreignKeysResult.getInsertedId()).thenReturn(BsonObjectId(userId))
    when(orgsMock.insertOne(any[ForeignKeys])).thenReturn(foreignKeysResult)
    (
      orgsMock,
      orgAccountsCollMock,
      orgProfilesCollMock,
      accountId,
      profileId
    )

  "insert" should "delegate inserting a member's account and profile to the respective Mongo collections" in:
    val (membersMock, memberAccountsCollMock, memberProfilesCollMock, _, _) = setupMemberMocks()
    val memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile] =
      new MongoAccountProfileRepository(membersMock, memberAccountsCollMock, memberProfilesCollMock)
    memberAccountProfileRepo.insert(member.account, member.profile)
    verify(memberAccountsCollMock).insertOne(member.account)
    verify(memberProfilesCollMock).insertOne(member.profile)
    verify(membersMock).insertOne(any[ForeignKeys])

  it should "create foreign keys for the inserted member using the Mongo generated accountId and profileId" in:
    val (membersMock, memberAccountsCollMock, memberProfilesCollMock, accountId, profileId) = setupMemberMocks()
    val memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile] =
      new MongoAccountProfileRepository(membersMock, memberAccountsCollMock, memberProfilesCollMock)
    memberAccountProfileRepo.insert(member.account, member.profile)
    val foreignKeysCaptor = ArgumentCaptor.forClass(classOf[ForeignKeys])
    verify(membersMock).insertOne(foreignKeysCaptor.capture())
    val insertedForeignKeys = foreignKeysCaptor.getValue()
    insertedForeignKeys.accountId shouldEqual accountId.toHexString()
    insertedForeignKeys.profileId shouldEqual profileId.toHexString()

  it should "delegate inserting an organization's account and profile to the respective Mongo collections" in:
    val (orgsMock, orgAccountsCollMock, orgProfilesCollMock, _, _) = setupOrganizationMocks()
    val orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
      new MongoAccountProfileRepository(orgsMock, orgAccountsCollMock, orgProfilesCollMock)
    orgAccountProfileRepo.insert(organization.account, organization.profile)
    verify(orgAccountsCollMock).insertOne(organization.account)
    verify(orgProfilesCollMock).insertOne(organization.profile)
    verify(orgsMock).insertOne(any[ForeignKeys])

  it should "create foreign keys for the inserted organization using the Mongo generated accountId and profileId" in:
    val (orgsMock, orgAccountsCollMock, orgProfilesCollMock, accountId, profileId) = setupOrganizationMocks()
    val orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
      new MongoAccountProfileRepository(orgsMock, orgAccountsCollMock, orgProfilesCollMock)
    orgAccountProfileRepo.insert(organization.account, organization.profile)
    val foreignKeysCaptor = ArgumentCaptor.forClass(classOf[ForeignKeys])
    verify(orgsMock).insertOne(foreignKeysCaptor.capture())
    val insertedForeignKeys = foreignKeysCaptor.getValue()
    insertedForeignKeys.accountId shouldEqual accountId.toHexString()
    insertedForeignKeys.profileId shouldEqual profileId.toHexString()
