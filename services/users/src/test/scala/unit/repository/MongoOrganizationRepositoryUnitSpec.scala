package unit.repository

import fixtures.OrganizationFixtures.organization
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.AccountProfileRepository
import repository.MongoOrganizationRepository
import repository.OrganizationRepository

class MongoOrganizationRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  "insert" should "delegate inserting an organization's account and profile to the organization account-profile repository" in:
    val orgAccountProfileRepoMock: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
      mock(classOf[AccountProfileRepository[OrganizationAccount, OrganizationProfile]])
    val orgRepo: OrganizationRepository = new MongoOrganizationRepository(orgAccountProfileRepoMock)
    orgRepo.insert(organization)
    verify(orgAccountProfileRepoMock).insert(organization.account, organization.profile)
