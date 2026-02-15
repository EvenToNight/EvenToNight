package unit.infrastructure.persistence.mongo.repositories

import com.mongodb.client.MongoCollection
import com.mongodb.client.result.InsertOneResult
import domain.repository.AccountProfileRepository
import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile
import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile
import fixtures.MemberFixtures.member
import fixtures.MemberFixtures.memberUserId
import fixtures.OrganizationFixtures.organization
import fixtures.OrganizationFixtures.organizationUserId
import infrastructure.persistence.mongo.models.UserReferences
import infrastructure.persistence.mongo.repositories.MongoAccountProfileRepository
import org.bson.BsonObjectId
import org.bson.types.ObjectId
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class MongoAccountProfileRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  private def setupMemberMocks() =
    val memberReferencesCollMock: MongoCollection[UserReferences] = mock(classOf[MongoCollection[UserReferences]])
    val memberAccountsCollMock: MongoCollection[MemberAccount]    = mock(classOf[MongoCollection[MemberAccount]])
    val memberProfilesCollMock: MongoCollection[MemberProfile]    = mock(classOf[MongoCollection[MemberProfile]])

    val accountId     = ObjectId()
    val accountResult = mock(classOf[InsertOneResult])
    when(accountResult.getInsertedId()).thenReturn(BsonObjectId(accountId))
    when(memberAccountsCollMock.insertOne(member.account)).thenReturn(accountResult)

    val profileId     = ObjectId()
    val profileResult = mock(classOf[InsertOneResult])
    when(profileResult.getInsertedId()).thenReturn(BsonObjectId(profileId))
    when(memberProfilesCollMock.insertOne(member.profile)).thenReturn(profileResult)

    val userId           = ObjectId()
    val referencesResult = mock(classOf[InsertOneResult])
    when(referencesResult.getInsertedId()).thenReturn(BsonObjectId(userId))
    when(memberReferencesCollMock.insertOne(any[UserReferences])).thenReturn(referencesResult)
    (
      memberReferencesCollMock,
      memberAccountsCollMock,
      memberProfilesCollMock,
      accountId,
      profileId
    )

  private def setupOrganizationMocks() =
    val orgReferencesCollMock: MongoCollection[UserReferences]    = mock(classOf[MongoCollection[UserReferences]])
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

    val userId           = ObjectId()
    val referencesResult = mock(classOf[InsertOneResult])
    when(referencesResult.getInsertedId()).thenReturn(BsonObjectId(userId))
    when(orgReferencesCollMock.insertOne(any[UserReferences])).thenReturn(referencesResult)
    (
      orgReferencesCollMock,
      orgAccountsCollMock,
      orgProfilesCollMock,
      accountId,
      profileId
    )

  private def createAccountProfileRepo[A, P](
      referencesColl: MongoCollection[UserReferences],
      accountsColl: MongoCollection[A],
      profilesColl: MongoCollection[P]
  ): AccountProfileRepository[A, P] =
    new MongoAccountProfileRepository(referencesColl, accountsColl, profilesColl)

  "insert" should "delegate member's account and profile insertion to the respective Mongo collections" in:
    val (memberReferencesCollMock, memberAccountsCollMock, memberProfilesCollMock, _, _) = setupMemberMocks()
    val repo = createAccountProfileRepo[MemberAccount, MemberProfile](
      memberReferencesCollMock,
      memberAccountsCollMock,
      memberProfilesCollMock
    )
    repo.insert(member.account, member.profile, memberUserId)
    verify(memberAccountsCollMock).insertOne(member.account)
    verify(memberProfilesCollMock).insertOne(member.profile)

  it should "persist user references for the inserted member" in:
    val (memberReferencesCollMock, memberAccountsCollMock, memberProfilesCollMock, accountId, profileId) =
      setupMemberMocks()
    val repo = createAccountProfileRepo[MemberAccount, MemberProfile](
      memberReferencesCollMock,
      memberAccountsCollMock,
      memberProfilesCollMock
    )
    repo.insert(member.account, member.profile, memberUserId)
    val userReferencesCaptor = ArgumentCaptor.forClass(classOf[UserReferences])
    verify(memberReferencesCollMock).insertOne(userReferencesCaptor.capture())
    val insertedReferences = userReferencesCaptor.getValue()
    insertedReferences.userId shouldBe memberUserId
    insertedReferences.accountId shouldBe accountId.toHexString()
    insertedReferences.profileId shouldBe profileId.toHexString()

  it should "delegate organization's account and profile insertion to the respective Mongo collections" in:
    val (orgReferencesCollMock, orgAccountsCollMock, orgProfilesCollMock, _, _) = setupOrganizationMocks()
    val repo = createAccountProfileRepo[OrganizationAccount, OrganizationProfile](
      orgReferencesCollMock,
      orgAccountsCollMock,
      orgProfilesCollMock
    )
    repo.insert(organization.account, organization.profile, organizationUserId)
    verify(orgAccountsCollMock).insertOne(organization.account)
    verify(orgProfilesCollMock).insertOne(organization.profile)

  it should "persist user references for the inserted organization" in:
    val (orgReferencesCollMock, orgAccountsCollMock, orgProfilesCollMock, accountId, profileId) =
      setupOrganizationMocks()
    val repo = createAccountProfileRepo[OrganizationAccount, OrganizationProfile](
      orgReferencesCollMock,
      orgAccountsCollMock,
      orgProfilesCollMock
    )
    repo.insert(organization.account, organization.profile, organizationUserId)
    val userReferencesCaptor = ArgumentCaptor.forClass(classOf[UserReferences])
    verify(orgReferencesCollMock).insertOne(userReferencesCaptor.capture())
    val insertedReferences = userReferencesCaptor.getValue()
    insertedReferences.userId shouldBe organizationUserId
    insertedReferences.accountId shouldBe accountId.toHexString()
    insertedReferences.profileId shouldBe profileId.toHexString()
