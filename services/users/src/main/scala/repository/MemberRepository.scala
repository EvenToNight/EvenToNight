package repository

import model.Member
import model.member.MemberAccount
import model.member.MemberProfile

trait MemberRepository:
  def insert(member: Member, userId: String): String
  def getAllMembers(): List[Member]
  def findById(userId: String): Option[Member]

class MongoMemberRepository(
    memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile]
) extends MemberRepository:
  override def insert(member: Member, userId: String) =
    memberAccountProfileRepo.insert(member.account, member.profile, userId)

  override def getAllMembers(): List[Member] =
    memberAccountProfileRepo.getAll().map { case (account, profile) =>
      Member(account, profile)
    }

  override def findById(userId: String): Option[Member] =
    memberAccountProfileRepo.findById(userId) match
      case Some((account, profile)) => Some(Member(account, profile))
      case None                     => None
