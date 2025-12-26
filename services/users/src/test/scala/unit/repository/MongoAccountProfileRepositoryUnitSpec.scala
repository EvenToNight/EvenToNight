package unit.repository

import com.mongodb.client.MongoCollection
import com.mongodb.client.result.InsertOneResult
import fixtures.MemberFixtures.member
import fixtures.MemberFixtures.memberUserId
import fixtures.OrganizationFixtures.organization
import fixtures.OrganizationFixtures.organizationUserId
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
    val memberForeignKeysCollMock: MongoCollection[ForeignKeys] = mock(classOf[MongoCollection[ForeignKeys]])
    val memberAccountsCollMock: MongoCollection[MemberAccount]  = mock(classOf[MongoCollection[MemberAccount]])
    val memberProfilesCollMock: MongoCollection[MemberProfile]  = mock(classOf[MongoCollection[MemberProfile]])

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
    when(memberForeignKeysCollMock.insertOne(any[ForeignKeys])).thenReturn(foreignKeysResult)
    (
      memberForeignKeysCollMock,
      memberAccountsCollMock,
      memberProfilesCollMock,
      accountId,
      profileId
    )

  private def setupOrganizationMocks() =
    val orgForeignKeysCollMock: MongoCollection[ForeignKeys]      = mock(classOf[MongoCollection[ForeignKeys]])
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
    when(orgForeignKeysCollMock.insertOne(any[ForeignKeys])).thenReturn(foreignKeysResult)
    (
      orgForeignKeysCollMock,
      orgAccountsCollMock,
      orgProfilesCollMock,
      accountId,
      profileId
    )

  private def createAccountProfileRepo[A, P](
      foreignKeysColl: MongoCollection[ForeignKeys],
      accountsColl: MongoCollection[A],
      profilesColl: MongoCollection[P]
  ): AccountProfileRepository[A, P] =
    new MongoAccountProfileRepository(foreignKeysColl, accountsColl, profilesColl)

  "insert" should "delegate member's account and profile insertion to the respective Mongo collections and return the userId" in:
    val (memberForeignKeysCollMock, memberAccountsCollMock, memberProfilesCollMock, _, _) = setupMemberMocks()
    val memberAccountProfileRepo = createAccountProfileRepo[MemberAccount, MemberProfile](
      memberForeignKeysCollMock,
      memberAccountsCollMock,
      memberProfilesCollMock
    )
    val result = memberAccountProfileRepo.insert(member.account, member.profile, memberUserId)
    verify(memberAccountsCollMock).insertOne(member.account)
    verify(memberProfilesCollMock).insertOne(member.profile)
    result shouldBe memberUserId

  it should "create foreign keys for the inserted member using the userId and the Mongo generated accountId and profileId" in:
    val (memberForeignKeysCollMock, memberAccountsCollMock, memberProfilesCollMock, accountId, profileId) =
      setupMemberMocks()
    val memberAccountProfileRepo = createAccountProfileRepo[MemberAccount, MemberProfile](
      memberForeignKeysCollMock,
      memberAccountsCollMock,
      memberProfilesCollMock
    )
    memberAccountProfileRepo.insert(member.account, member.profile, memberUserId)
    val foreignKeysCaptor = ArgumentCaptor.forClass(classOf[ForeignKeys])
    verify(memberForeignKeysCollMock).insertOne(foreignKeysCaptor.capture())
    val insertedForeignKeys = foreignKeysCaptor.getValue()
    insertedForeignKeys.userId shouldBe memberUserId
    insertedForeignKeys.accountId shouldBe accountId.toHexString()
    insertedForeignKeys.profileId shouldBe profileId.toHexString()

  it should "delegate organization's account and profile insertion to the respective Mongo collections and return the userId" in:
    val (orgForeignKeysCollMock, orgAccountsCollMock, orgProfilesCollMock, _, _) = setupOrganizationMocks()
    val orgAccountProfileRepo = createAccountProfileRepo[OrganizationAccount, OrganizationProfile](
      orgForeignKeysCollMock,
      orgAccountsCollMock,
      orgProfilesCollMock
    )
    val result = orgAccountProfileRepo.insert(organization.account, organization.profile, organizationUserId)
    verify(orgAccountsCollMock).insertOne(organization.account)
    verify(orgProfilesCollMock).insertOne(organization.profile)
    result shouldBe organizationUserId

  it should "create foreign keys for the inserted organization using the userId and the Mongo generated accountId and profileId" in:
    val (orgForeignKeysCollMock, orgAccountsCollMock, orgProfilesCollMock, accountId, profileId) =
      setupOrganizationMocks()
    val orgAccountProfileRepo = createAccountProfileRepo[OrganizationAccount, OrganizationProfile](
      orgForeignKeysCollMock,
      orgAccountsCollMock,
      orgProfilesCollMock
    )
    orgAccountProfileRepo.insert(organization.account, organization.profile, organizationUserId)
    val foreignKeysCaptor = ArgumentCaptor.forClass(classOf[ForeignKeys])
    verify(orgForeignKeysCollMock).insertOne(foreignKeysCaptor.capture())
    val insertedForeignKeys = foreignKeysCaptor.getValue()
    insertedForeignKeys.userId shouldBe organizationUserId
    insertedForeignKeys.accountId shouldBe accountId.toHexString()
    insertedForeignKeys.profileId shouldBe profileId.toHexString()
