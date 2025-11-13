package repository

import model.Member
import model.member.MemberAccount
import model.member.MemberProfile

trait MemberRepository:
  def insert(member: Member): Unit

class MongoMemberRepository(
    memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile]
) extends MemberRepository:
  override def insert(member: Member) =
    memberAccountProfileRepo.insert(member.account, member.profile)
