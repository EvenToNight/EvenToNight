package unit.infrastructure.services

import domain.repository.MemberRepository
import domain.repository.OrganizationRepository
import domain.service.UserService
import fixtures.MemberFixtures.member
import fixtures.MemberFixtures.memberUserId
import fixtures.OrganizationFixtures.organization
import fixtures.OrganizationFixtures.organizationUserId
import infrastructure.services.UserServiceImpl
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class UserServiceImplUnitSpec extends AnyFlatSpec with Matchers:
  "insertUser" should "delegate inserting a member to the member repository" in:
    val memberRepoMock: MemberRepository    = mock(classOf[MemberRepository])
    val orgRepoMock: OrganizationRepository = mock(classOf[OrganizationRepository])
    val service: UserService                = new UserServiceImpl(memberRepoMock, orgRepoMock)
    service.insertUser(member, memberUserId)
    verify(memberRepoMock).insert(member, memberUserId)

  "insertUser" should "delegate inserting an organization to the organization repository" in:
    val memberRepoMock: MemberRepository    = mock(classOf[MemberRepository])
    val orgRepoMock: OrganizationRepository = mock(classOf[OrganizationRepository])
    val service: UserService                = new UserServiceImpl(memberRepoMock, orgRepoMock)
    service.insertUser(organization, organizationUserId)
    verify(orgRepoMock).insert(organization, organizationUserId)
