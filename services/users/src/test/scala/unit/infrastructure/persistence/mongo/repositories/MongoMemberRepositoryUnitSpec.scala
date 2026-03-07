package unit.infrastructure.persistence.mongo.repositories

import com.mongodb.client.FindIterable
import com.mongodb.client.MongoCollection
import com.mongodb.client.model.FindOneAndUpdateOptions
import domain.aggregates.Member
import domain.repository.MemberRepository
import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile
import fixtures.MemberFixtures.member
import fixtures.MemberFixtures.memberUserId
import infrastructure.persistence.mongo.models.member.MemberDocument
import infrastructure.persistence.mongo.repositories.MongoMemberRepository
import org.bson.conversions.Bson
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito._
import org.mockito.invocation.InvocationOnMock
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class MongoMemberRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  private def setup() =
    val membersCollMock: MongoCollection[MemberDocument] = mock(classOf[MongoCollection[MemberDocument]])
    val repo: MemberRepository                           = new MongoMemberRepository(membersCollMock)
    (membersCollMock, repo)

  "insert" should "insert a document for the given member into the Mongo collection" in:
    val (membersCollMock, repo) = setup()

    repo.insert(member, memberUserId)

    val documentCaptor = ArgumentCaptor.forClass(classOf[MemberDocument])
    verify(membersCollMock).insertOne(documentCaptor.capture())
    val insertedMember = documentCaptor.getValue
    insertedMember.userId shouldBe memberUserId
    insertedMember.account shouldBe member.account
    insertedMember.profile shouldBe member.profile

  "getAllMembers" should "return all members with the corresponding id from the Mongo collection" in:
    val (membersCollMock, repo) = setup()
    val allMembers = List(
      MemberDocument(memberUserId, member.account, member.profile)
    )

    val findIterableMock = mock(classOf[FindIterable[MemberDocument]])
    when(membersCollMock.find()).thenReturn(findIterableMock)
    when(findIterableMock.into(any())).thenAnswer((invocation: InvocationOnMock) => {
      val list = invocation.getArgument(0).asInstanceOf[java.util.List[MemberDocument]]
      allMembers.foreach(list.add)
      list
    })

    val result = repo.getAllMembers()

    result shouldBe List((memberUserId, member))

  "findById" should "return Some(Member) when the document with the given id exists in the Mongo collection" in:
    val (membersCollMock, repo) = setup()
    val doc                     = MemberDocument(memberUserId, member.account, member.profile)

    val findIterableMock = mock(classOf[FindIterable[MemberDocument]])
    val bsonCaptor       = ArgumentCaptor.forClass(classOf[Bson])
    when(membersCollMock.find(bsonCaptor.capture())).thenReturn(findIterableMock)
    when(findIterableMock.first()).thenReturn(doc)

    val result = repo.findById(memberUserId)

    result shouldBe Some(member)
    bsonCaptor.getValue.toString should include(memberUserId)

  it should "return None when the document with the given id does not exist in the Mongo collection" in:
    val (membersCollMock, repo) = setup()

    val findIterableMock = mock(classOf[FindIterable[MemberDocument]])
    when(membersCollMock.find(any[Bson])).thenReturn(findIterableMock)
    when(findIterableMock.first()).thenReturn(null)

    val result = repo.findById(memberUserId)

    result shouldBe None

  "delete" should "delete the document with the given id from the Mongo collection" in:
    val (membersCollMock, repo) = setup()

    repo.delete(memberUserId)

    val bsonCaptor = ArgumentCaptor.forClass(classOf[Bson])
    verify(membersCollMock).deleteOne(bsonCaptor.capture())
    bsonCaptor.getValue.toString should include(memberUserId)

  "update" should "replace the existing document with the given id in the Mongo collection" in:
    val (membersCollMock, repo) = setup()

    repo.update(member, memberUserId)

    val bsonCaptor     = ArgumentCaptor.forClass(classOf[Bson])
    val documentCaptor = ArgumentCaptor.forClass(classOf[MemberDocument])
    verify(membersCollMock).replaceOne(bsonCaptor.capture(), documentCaptor.capture())
    bsonCaptor.getValue.toString should include(memberUserId)
    val updatedMember = documentCaptor.getValue
    updatedMember.userId shouldBe memberUserId
    updatedMember.account shouldBe member.account
    updatedMember.profile shouldBe member.profile

  "updateAvatar" should "update the member's avatar and return the updated member when the document with the given id is found in the Mongo collection" in:
    val (membersCollMock, repo) = setup()
    val newAvatar               = "new.jpg"
    val updatedProfile          = member.profile.copy(avatar = newAvatar)
    val updatedDoc              = MemberDocument(memberUserId, member.account, updatedProfile)

    val bsonIdCaptor     = ArgumentCaptor.forClass(classOf[Bson])
    val bsonAvatarCaptor = ArgumentCaptor.forClass(classOf[Bson])
    when(membersCollMock.findOneAndUpdate(
      bsonIdCaptor.capture(),
      bsonAvatarCaptor.capture(),
      any[FindOneAndUpdateOptions]()
    ))
      .thenReturn(updatedDoc)

    val result = repo.updateAvatar(memberUserId, newAvatar)

    bsonIdCaptor.getValue.toString should include(memberUserId)
    bsonAvatarCaptor.getValue.toString should include(newAvatar)
    result shouldBe Some(Member(member.account, updatedProfile))

  it should "return None when the document with the given id is not found in the Mongo collection" in:
    val (membersCollMock, repo) = setup()
    val newAvatar               = "new.jpg"

    when(membersCollMock.findOneAndUpdate(any[Bson](), any[Bson](), any[FindOneAndUpdateOptions]()))
      .thenReturn(null)

    val result = repo.updateAvatar(memberUserId, newAvatar)
    result shouldBe None
