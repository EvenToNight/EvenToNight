package unit.infrastructure.persistence.repositories

import domain.repository.AccountProfileRepository
import domain.repository.OrganizationRepository
import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile
import fixtures.OrganizationFixtures.organization
import fixtures.OrganizationFixtures.organizationUserId
import infrastructure.persistence.repositories.OrganizationRepositoryImpl
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class OrganizationRepositoryImplUnitSpec extends AnyFlatSpec with Matchers:
  "insert" should "delegate organization's account and profile insertion to the organization account-profile repository" in:
    val orgAccountProfileRepoMock: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
      mock(classOf[AccountProfileRepository[OrganizationAccount, OrganizationProfile]])
    val orgRepo: OrganizationRepository = new OrganizationRepositoryImpl(orgAccountProfileRepoMock)
    orgRepo.insert(organization, organizationUserId)
    verify(orgAccountProfileRepoMock).insert(organization.account, organization.profile, organizationUserId)
