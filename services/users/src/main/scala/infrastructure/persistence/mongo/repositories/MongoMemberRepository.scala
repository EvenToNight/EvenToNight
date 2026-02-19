package infrastructure.persistence.mongo.repositories

import com.mongodb.client.MongoCollection
import com.mongodb.client.model.Filters
import com.mongodb.client.model.FindOneAndUpdateOptions
import com.mongodb.client.model.ReturnDocument
import com.mongodb.client.model.Updates
import domain.aggregates.Member
import domain.repository.MemberRepository
import infrastructure.persistence.mongo.models.member.MemberDocument

import java.util.ArrayList
import scala.jdk.CollectionConverters._

class MongoMemberRepository(
    membersColl: MongoCollection[MemberDocument]
) extends MemberRepository:
  override def insert(member: Member, userId: String) =
    membersColl.insertOne(MemberDocument(userId, member.account, member.profile))

  override def getAllMembers() =
    membersColl.find().into(new ArrayList[MemberDocument]()).asScala.toList
      .map(doc => (doc.userId, Member(doc.account, doc.profile)))

  override def findById(userId: String) =
    Option(membersColl.find(Filters.eq("_id", userId)).first())
      .map(doc => Member(doc.account, doc.profile))

  override def delete(userId: String) =
    membersColl.deleteOne(Filters.eq("_id", userId))

  override def update(updatedMember: Member, userId: String) =
    membersColl.replaceOne(
      Filters.eq("_id", userId),
      MemberDocument(userId, updatedMember.account, updatedMember.profile)
    )

  override def updateAvatar(userId: String, newAvatar: String) =
    val updated = membersColl.findOneAndUpdate(
      Filters.eq("_id", userId),
      Updates.set("profile.avatar", newAvatar),
      new FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
    )
    Option(updated).map(doc => Member(doc.account, doc.profile))

  override def search(prefix: Option[String], limit: Int) =
    val allDocs = membersColl.find().into(new ArrayList[MemberDocument]()).asScala.toList
    val filtered = prefix match
      case Some(p) =>
        val lower = p.toLowerCase
        allDocs.filter { doc =>
          doc.account.username.toLowerCase.startsWith(lower) ||
          doc.profile.name.toLowerCase.startsWith(lower)
        }
      case None => allDocs

    filtered.take(limit).map(doc => (doc.userId, Member(doc.account, doc.profile)))
