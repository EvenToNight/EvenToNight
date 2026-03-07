package unit.infrastructure.persistence.mongo.repositories

import com.mongodb.client.FindIterable
import com.mongodb.client.MongoCollection
import com.mongodb.client.model.FindOneAndUpdateOptions
import domain.aggregates.Organization
import domain.repository.OrganizationRepository
import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile
import fixtures.OrganizationFixtures.organization
import fixtures.OrganizationFixtures.organizationUserId
import infrastructure.persistence.mongo.models.organization.OrganizationDocument
import infrastructure.persistence.mongo.repositories.MongoOrganizationRepository
import org.bson.conversions.Bson
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito._
import org.mockito.invocation.InvocationOnMock
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class MongoOrganizationRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  private def setup() =
    val orgsCollMock: MongoCollection[OrganizationDocument] = mock(classOf[MongoCollection[OrganizationDocument]])
    val repo: OrganizationRepository                        = new MongoOrganizationRepository(orgsCollMock)
    (orgsCollMock, repo)

  "insert" should "insert a document for the given organization into the Mongo collection" in:
    val (orgsCollMock, repo) = setup()

    repo.insert(organization, organizationUserId)

    val documentCaptor = ArgumentCaptor.forClass(classOf[OrganizationDocument])
    verify(orgsCollMock).insertOne(documentCaptor.capture())
    val insertedOrg = documentCaptor.getValue
    insertedOrg.userId shouldBe organizationUserId
    insertedOrg.account shouldBe organization.account
    insertedOrg.profile shouldBe organization.profile

  "getAllOrganizations" should "return all organizations with the corresponding id from the Mongo collection" in:
    val (orgsCollMock, repo) = setup()
    val allOrganizations = List(
      OrganizationDocument(organizationUserId, organization.account, organization.profile)
    )

    val findIterableMock = mock(classOf[FindIterable[OrganizationDocument]])
    when(orgsCollMock.find()).thenReturn(findIterableMock)
    when(findIterableMock.into(any())).thenAnswer((invocation: InvocationOnMock) => {
      val list = invocation.getArgument(0).asInstanceOf[java.util.List[OrganizationDocument]]
      allOrganizations.foreach(list.add)
      list
    })

    val result = repo.getAllOrganizations()

    result shouldBe List((organizationUserId, organization))

  "findById" should "return Some(Organization) when the document with the given id exists in the Mongo collection" in:
    val (orgsCollMock, repo) = setup()
    val doc                  = OrganizationDocument(organizationUserId, organization.account, organization.profile)

    val findIterableMock = mock(classOf[FindIterable[OrganizationDocument]])
    val bsonCaptor       = ArgumentCaptor.forClass(classOf[Bson])
    when(orgsCollMock.find(bsonCaptor.capture())).thenReturn(findIterableMock)
    when(findIterableMock.first()).thenReturn(doc)

    val result = repo.findById(organizationUserId)

    result shouldBe Some(organization)
    bsonCaptor.getValue.toString should include(organizationUserId)

  it should "return None when the document with the given id does not exist in the Mongo collection" in:
    val (orgsCollMock, repo) = setup()

    val findIterableMock = mock(classOf[FindIterable[OrganizationDocument]])
    when(orgsCollMock.find(any[Bson])).thenReturn(findIterableMock)
    when(findIterableMock.first()).thenReturn(null)

    val result = repo.findById(organizationUserId)

    result shouldBe None

  "delete" should "delete the document with the given id from the Mongo collection" in:
    val (orgsCollMock, repo) = setup()

    repo.delete(organizationUserId)

    val bsonCaptor = ArgumentCaptor.forClass(classOf[Bson])
    verify(orgsCollMock).deleteOne(bsonCaptor.capture())
    bsonCaptor.getValue.toString should include(organizationUserId)

  "update" should "replace the existing document with the given id in the Mongo collection" in:
    val (orgsCollMock, repo) = setup()

    repo.update(organization, organizationUserId)

    val bsonCaptor     = ArgumentCaptor.forClass(classOf[Bson])
    val documentCaptor = ArgumentCaptor.forClass(classOf[OrganizationDocument])
    verify(orgsCollMock).replaceOne(bsonCaptor.capture(), documentCaptor.capture())
    bsonCaptor.getValue.toString should include(organizationUserId)
    val updatedOrg = documentCaptor.getValue
    updatedOrg.userId shouldBe organizationUserId
    updatedOrg.account shouldBe organization.account
    updatedOrg.profile shouldBe organization.profile

  "updateAvatar" should "update the organization's avatar and return the updated organization when the document with the given id is found in the Mongo collection" in:
    val (orgsCollMock, repo) = setup()
    val newAvatar            = "new.jpg"
    val updatedProfile       = organization.profile.copy(avatar = newAvatar)
    val updatedDoc           = OrganizationDocument(organizationUserId, organization.account, updatedProfile)

    val bsonIdCaptor     = ArgumentCaptor.forClass(classOf[Bson])
    val bsonAvatarCaptor = ArgumentCaptor.forClass(classOf[Bson])
    when(orgsCollMock.findOneAndUpdate(
      bsonIdCaptor.capture(),
      bsonAvatarCaptor.capture(),
      any[FindOneAndUpdateOptions]()
    ))
      .thenReturn(updatedDoc)

    val result = repo.updateAvatar(organizationUserId, newAvatar)

    bsonIdCaptor.getValue.toString should include(organizationUserId)
    bsonAvatarCaptor.getValue.toString should include(newAvatar)
    result shouldBe Some(Organization(organization.account, updatedProfile))

  it should "return None when the document with the given id is not found in the Mongo collection" in:
    val (orgsCollMock, repo) = setup()
    val newAvatar            = "new.jpg"

    when(orgsCollMock.findOneAndUpdate(any[Bson](), any[Bson](), any[FindOneAndUpdateOptions]()))
      .thenReturn(null)

    val result = repo.updateAvatar(organizationUserId, newAvatar)
    result shouldBe None
