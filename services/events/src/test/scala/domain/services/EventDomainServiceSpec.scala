package domain.services

import domain.repositories.OrganizationRepository
import domain.valueobjects.OrganizationId
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventDomainServiceSpec extends AnyFlatSpec with Matchers:

  // A simple fake repository for testing without Mock framework
  class FakeOrganizationRepository extends OrganizationRepository:
    var existingOrgs: Set[String] = Set("org-1", "org-2")
    var orgNames: Map[String, String] = Map("org-1" -> "First Org", "org-2" -> "Second Org")

    override def isOrganization(id: OrganizationId): Boolean = existingOrgs.contains(id.value)
    
    // Stub implementation for context-based method not used by EventDomainService directly
    override def isOrganization(id: OrganizationId, ctx: domain.repositories.TransactionContext): Boolean = 
      isOrganization(id)
      
    override def getOrganizationName(id: OrganizationId): Option[String] = orgNames.get(id.value)

  "EventDomainService.validateCreatorIsOrganization" should "return Right if organization exists" in {
    val repo = new FakeOrganizationRepository()
    val service = new EventDomainService(repo)
    
    val result = service.validateCreatorIsOrganization(OrganizationId.unsafe("org-1"))
    result.isRight.shouldBe(true)
  }

  it should "return Left if organization does not exist" in {
    val repo = new FakeOrganizationRepository()
    val service = new EventDomainService(repo)
    
    val result = service.validateCreatorIsOrganization(OrganizationId.unsafe("unknown"))
    result.isLeft.shouldBe(true)
    result.left.getOrElse("") should include("Only organizations can create events")
  }

  "EventDomainService.validateCollaboratorsAreOrganizations" should "return Right if all collaborators exist" in {
    val repo = new FakeOrganizationRepository()
    val service = new EventDomainService(repo)
    
    val collaborators = List(OrganizationId.unsafe("org-1"), OrganizationId.unsafe("org-2"))
    val result = service.validateCollaboratorsAreOrganizations(collaborators)
    result.isRight.shouldBe(true)
  }

  it should "return Left if at least one collaborator does not exist" in {
    val repo = new FakeOrganizationRepository()
    val service = new EventDomainService(repo)
    
    val collaborators = List(OrganizationId.unsafe("org-1"), OrganizationId.unsafe("unknown"))
    val result = service.validateCollaboratorsAreOrganizations(collaborators)
    result.isLeft.shouldBe(true)
    result.left.getOrElse("") should include("Only organizations can be collaborators")
  }

  "EventDomainService.getOrganizationNameOrEmpty" should "return name if organization exists" in {
    val repo = new FakeOrganizationRepository()
    val service = new EventDomainService(repo)
    
    val name = service.getOrganizationNameOrEmpty(OrganizationId.unsafe("org-1"))
    name shouldBe "First Org"
  }

  it should "return empty string if organization does not exist" in {
    val repo = new FakeOrganizationRepository()
    val service = new EventDomainService(repo)
    
    val name = service.getOrganizationNameOrEmpty(OrganizationId.unsafe("unknown"))
    name shouldBe ""
  }
