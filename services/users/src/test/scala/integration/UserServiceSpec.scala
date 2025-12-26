package integration

import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Filters.{eq => eqFilter}
import fixtures.MemberFixtures.member
import fixtures.MemberFixtures.memberUserId
import fixtures.OrganizationFixtures.organization
import fixtures.OrganizationFixtures.organizationUserId
import infrastructure.MongoConnection.client
import model.ForeignKeys
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import org.bson.types.ObjectId
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.AccountProfileRepository
import repository.MemberRepository
import repository.MongoAccountProfileRepository
import repository.MongoMemberRepository
import repository.MongoOrganizationRepository
import repository.OrganizationRepository
import service.UserService

class UserServiceSpec extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  val membersDB: MongoDatabase = client.getDatabase("members_db_test")
  val orgsDB: MongoDatabase    = client.getDatabase("organizations_db_test")

  val memberForeignKeysColl: MongoCollection[ForeignKeys] =
    membersDB.getCollection("member_foreign_keys", classOf[ForeignKeys])
  val orgForeignKeysColl: MongoCollection[ForeignKeys] =
    orgsDB.getCollection("organization_foreign_keys", classOf[ForeignKeys])
  val memberAccountsColl: MongoCollection[MemberAccount] =
    membersDB.getCollection("member_accounts", classOf[MemberAccount])
  val memberProfilesColl: MongoCollection[MemberProfile] =
    membersDB.getCollection("member_profiles", classOf[MemberProfile])
  val orgAccountsColl: MongoCollection[OrganizationAccount] =
    orgsDB.getCollection("organization_accounts", classOf[OrganizationAccount])
  val orgProfilesColl: MongoCollection[OrganizationProfile] =
    orgsDB.getCollection("organization_profiles", classOf[OrganizationProfile])

  val memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile] =
    new MongoAccountProfileRepository(memberForeignKeysColl, memberAccountsColl, memberProfilesColl)
  val memberRepo: MemberRepository = new MongoMemberRepository(memberAccountProfileRepo)
  val orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
    new MongoAccountProfileRepository(orgForeignKeysColl, orgAccountsColl, orgProfilesColl)
  val orgRepo: OrganizationRepository = new MongoOrganizationRepository(orgAccountProfileRepo)

  val service: UserService = new UserService(memberRepo, orgRepo)

  private def clearCollections() =
    Seq(
      memberForeignKeysColl,
      orgForeignKeysColl,
      memberAccountsColl,
      memberProfilesColl,
      orgAccountsColl,
      orgProfilesColl
    ).foreach(_.deleteMany(Filters.empty()))

  override def beforeEach() =
    super.beforeEach()
    clearCollections()

  "insertUser" should "persist a member's account and profile and their references via foreign keys" in:
    service.insertUser(member, memberUserId)
    val foreignKeys = memberForeignKeysColl.find(eqFilter("_id", memberUserId)).first()
    foreignKeys.accountId should not be empty
    foreignKeys.profileId should not be empty

    val account = memberAccountsColl.find(eqFilter("_id", ObjectId(foreignKeys.accountId))).first()
    account.keycloakId shouldBe member.account.keycloakId
    account.email shouldBe member.account.email

    val profile = memberProfilesColl.find(eqFilter("_id", ObjectId(foreignKeys.profileId))).first()
    profile.nickname shouldBe member.profile.nickname

  it should "persist an organization's account and profile and their references via foreign keys" in:
    service.insertUser(organization, organizationUserId)
    val foreignKeys = orgForeignKeysColl.find(eqFilter("_id", organizationUserId)).first()
    foreignKeys.accountId should not be empty
    foreignKeys.profileId should not be empty

    val account = orgAccountsColl.find(eqFilter("_id", ObjectId(foreignKeys.accountId))).first()
    account.keycloakId shouldBe organization.account.keycloakId
    account.email shouldBe organization.account.email

    val profile = orgProfilesColl.find(eqFilter("_id", ObjectId(foreignKeys.profileId))).first()
    profile.nickname shouldBe organization.profile.nickname
