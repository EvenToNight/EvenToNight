package integration

import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Filters.{eq => eqFilter}
import fixtures.MemberFixtures.member
import fixtures.OrganizationFixtures.organization
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

  val membersColl: MongoCollection[ForeignKeys] =
    membersDB.getCollection("members", classOf[ForeignKeys])
  val orgsColl: MongoCollection[ForeignKeys] =
    orgsDB.getCollection("organizations", classOf[ForeignKeys])
  val memberAccountsColl: MongoCollection[MemberAccount] =
    membersDB.getCollection("member_accounts", classOf[MemberAccount])
  val memberProfilesColl: MongoCollection[MemberProfile] =
    membersDB.getCollection("member_profiles", classOf[MemberProfile])
  val orgAccountsColl: MongoCollection[OrganizationAccount] =
    orgsDB.getCollection("organization_accounts", classOf[OrganizationAccount])
  val orgProfilesColl: MongoCollection[OrganizationProfile] =
    orgsDB.getCollection("organization_profiles", classOf[OrganizationProfile])

  val memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile] =
    new MongoAccountProfileRepository(membersColl, memberAccountsColl, memberProfilesColl)
  val memberRepo: MemberRepository = new MongoMemberRepository(memberAccountProfileRepo)
  val orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
    new MongoAccountProfileRepository(orgsColl, orgAccountsColl, orgProfilesColl)
  val orgRepo: OrganizationRepository = new MongoOrganizationRepository(orgAccountProfileRepo)

  val service: UserService = new UserService(memberRepo, orgRepo)

  private def clearCollections() =
    Seq(
      membersColl,
      orgsColl,
      memberAccountsColl,
      memberProfilesColl,
      orgAccountsColl,
      orgProfilesColl
    ).foreach(_.deleteMany(Filters.empty()))

  override def beforeEach() =
    super.beforeEach()
    clearCollections()

  "insertUser" should "persist a member's account and profile along with their link" in:
    val userId      = service.insertUser(member)
    val foreignKeys = membersColl.find(eqFilter("_id", ObjectId(userId))).first()
    foreignKeys.accountId should not be empty
    foreignKeys.profileId should not be empty

    val account = memberAccountsColl.find(eqFilter("_id", ObjectId(foreignKeys.accountId))).first()
    account.keycloakId shouldEqual member.account.keycloakId
    account.email shouldEqual member.account.email

    val profile = memberProfilesColl.find(eqFilter("_id", ObjectId(foreignKeys.profileId))).first()
    profile.nickname shouldEqual member.profile.nickname

  it should "persist an organization's account and profile along with their link" in:
    val userId      = service.insertUser(organization)
    val foreignKeys = orgsColl.find(eqFilter("_id", ObjectId(userId))).first()
    foreignKeys.accountId should not be empty
    foreignKeys.profileId should not be empty

    val account = orgAccountsColl.find(eqFilter("_id", ObjectId(foreignKeys.accountId))).first()
    account.keycloakId shouldEqual organization.account.keycloakId
    account.email shouldEqual organization.account.email

    val profile = orgProfilesColl.find(eqFilter("_id", ObjectId(foreignKeys.profileId))).first()
    profile.nickname shouldEqual organization.profile.nickname
