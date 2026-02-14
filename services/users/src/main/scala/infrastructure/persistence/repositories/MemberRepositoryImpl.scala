package infrastructure.persistence.repositories

import domain.aggregates.Member
import domain.repository.AccountProfileRepository
import domain.repository.MemberRepository
import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile

class MemberRepositoryImpl(
    memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile]
) extends MemberRepository:
  override def insert(member: Member, userId: String) =
    memberAccountProfileRepo.insert(member.account, member.profile, userId)

  override def getAllMembers() =
    memberAccountProfileRepo.getAll().map { case (userId, account, profile) =>
      (userId, Member(account, profile))
    }

  override def findById(userId: String) =
    memberAccountProfileRepo.findById(userId) match
      case Some((account, profile)) => Some(Member(account, profile))
      case None                     => None

  override def delete(userId: String) =
    memberAccountProfileRepo.delete(userId)

  override def update(updatedMember: Member, userId: String) =
    memberAccountProfileRepo.update(updatedMember.account, updatedMember.profile, userId)

  override def updateAvatar(userId: String, newAvatar: String) =
    memberAccountProfileRepo.updateProfileAvatar(userId, newAvatar) match
      case Some((account, profile)) => Some(Member(account, profile))
      case None                     => None

  override def search(prefix: Option[String], limit: Int) =
    memberAccountProfileRepo.search(
      prefix,
      limit,
      getUsername = _.username,
      getName = _.name
    ).map { case (userId, account, profile) => (userId, Member(account, profile)) }
