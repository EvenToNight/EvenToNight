package integration

import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import com.mongodb.client.model.Filters.{eq => eqFilter}
import connection.MongoConnection
import fixtures.MemberFixtures.member
import model.member.MemberAccount
import model.member.MemberProfile
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.MemberRepository
import repository.MongoMemberRepository
import service.UserService

class UserServiceSpec extends AnyFlatSpec with Matchers:
  val membersDB: MongoDatabase = MongoConnection.membersDB

  val memberAccountsColl: MongoCollection[MemberAccount] =
    membersDB.getCollection("member_accounts", classOf[MemberAccount])
  val memberProfilesColl: MongoCollection[MemberProfile] =
    membersDB.getCollection("member_profiles", classOf[MemberProfile])

  val memberRepo: MemberRepository = new MongoMemberRepository(memberAccountsColl, memberProfilesColl)
  val service: UserService         = new UserService(memberRepo)

  "insertMember" should "insert the member account and profile into their respective MongoDB collections" in:
    service.insertUser(member)
    val accountOpt = Option(memberAccountsColl.find(eqFilter("_id", member.account.id)).first())
    accountOpt match
      case Some(accountOpt) => accountOpt.id shouldEqual member.account.id
      case None             => fail("Member account not found in member_accounts collection")
    val profileOpt = Option(memberProfilesColl.find(eqFilter("_id", member.profile.accountId)).first())
    profileOpt match
      case Some(profileOpt) => profileOpt.accountId shouldEqual member.profile.accountId
      case None             => fail("Member profile not found in member_profiles collection")
