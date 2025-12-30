package unit.service

import fixtures.MemberFixtures.member
import fixtures.MemberFixtures.memberUserId
import fixtures.OrganizationFixtures.organization
import fixtures.OrganizationFixtures.organizationUserId
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.MemberRepository
import repository.OrganizationRepository
import service.UserService

class UserServiceUnitSpec extends AnyFlatSpec with Matchers:
  "insertUser" should "delegate inserting a member to the member repository" in:
    val memberRepoMock: MemberRepository    = mock(classOf[MemberRepository])
    val orgRepoMock: OrganizationRepository = mock(classOf[OrganizationRepository])
    val service: UserService                = new UserService(memberRepoMock, orgRepoMock)
    when(memberRepoMock.insert(member, memberUserId)).thenReturn(memberUserId)
    val result = service.insertUser(member, memberUserId)
    verify(memberRepoMock).insert(member, memberUserId)
    result shouldBe memberUserId

  "insertUser" should "delegate inserting an organization to the organization repository" in:
    val memberRepoMock: MemberRepository    = mock(classOf[MemberRepository])
    val orgRepoMock: OrganizationRepository = mock(classOf[OrganizationRepository])
    val service: UserService                = new UserService(memberRepoMock, orgRepoMock)
    when(orgRepoMock.insert(organization, organizationUserId)).thenReturn(organizationUserId)
    val result = service.insertUser(organization, organizationUserId)
    verify(orgRepoMock).insert(organization, organizationUserId)
    result shouldBe organizationUserId
