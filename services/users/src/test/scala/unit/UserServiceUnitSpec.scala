package unit

import fixtures.MemberFixtures.member
import fixtures.OrganizationFixtures.organization
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
    service.insertUser(member)
    verify(memberRepoMock).insert(member)

  "insertUser" should "delegate inserting an organization to the organization repository" in:
    val memberRepoMock: MemberRepository    = mock(classOf[MemberRepository])
    val orgRepoMock: OrganizationRepository = mock(classOf[OrganizationRepository])
    val service: UserService                = new UserService(memberRepoMock, orgRepoMock)
    service.insertUser(organization)
    verify(orgRepoMock).insert(organization)
