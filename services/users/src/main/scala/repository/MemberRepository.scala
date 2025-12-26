package repository

import model.Member
import model.member.MemberAccount
import model.member.MemberProfile

trait MemberRepository:
  def insert(member: Member, userId: String): String

class MongoMemberRepository(
    memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile]
) extends MemberRepository:
  override def insert(member: Member, userId: String) =
    memberAccountProfileRepo.insert(member.account, member.profile, userId)
