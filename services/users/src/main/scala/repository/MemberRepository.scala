package repository

import com.mongodb.client.MongoCollection
import model.Member
import model.member.MemberAccount
import model.member.MemberProfile

class MemberRepository(
    memberAccountsColl: MongoCollection[MemberAccount],
    memberProfilesColl: MongoCollection[MemberProfile]
):
  def insert(member: Member): Unit =
    memberAccountsColl.insertOne(member.account)
    memberProfilesColl.insertOne(member.profile)
