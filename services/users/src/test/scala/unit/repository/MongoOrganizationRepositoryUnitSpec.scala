package unit.repository

import fixtures.OrganizationFixtures.organization
import fixtures.OrganizationFixtures.organizationUserId
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.AccountProfileRepository
import repository.MongoOrganizationRepository
import repository.OrganizationRepository

class MongoOrganizationRepositoryUnitSpec extends AnyFlatSpec with Matchers:
  "insert" should "delegate organization's account and profile insertion to the organization account-profile repository and propagate userId" in:
    val orgAccountProfileRepoMock: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
      mock(classOf[AccountProfileRepository[OrganizationAccount, OrganizationProfile]])
    val orgRepo: OrganizationRepository = new MongoOrganizationRepository(orgAccountProfileRepoMock)
    when(orgAccountProfileRepoMock.insert(
      organization.account,
      organization.profile,
      organizationUserId
    )).thenReturn(organizationUserId)
    val result = orgRepo.insert(organization, organizationUserId)
    verify(orgAccountProfileRepoMock).insert(organization.account, organization.profile, organizationUserId)
    result shouldBe organizationUserId
