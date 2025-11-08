package repository

import com.mongodb.client.MongoCollection
import model.Member
import model.member.MemberAccount
import model.member.MemberProfile

trait MemberRepository:
  def insert(member: Member): Unit

class MongoMemberRepository(
    memberAccountsColl: MongoCollection[MemberAccount],
    memberProfilesColl: MongoCollection[MemberProfile]
) extends MemberRepository:
  override def insert(member: Member) =
    memberAccountsColl.insertOne(member.account)
    memberProfilesColl.insertOne(member.profile)
