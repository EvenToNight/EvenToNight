package unit

import fixtures.MemberFixtures.member
import model.Member
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.MemberRepository
import service.UserService

class UserServiceUnitSpec extends AnyFlatSpec with Matchers:
  "insertUser" should "delegate inserting a member to the member repository" in:
    val repoMock: MemberRepository = mock(classOf[MemberRepository])
    val service: UserService       = new UserService(repoMock)
    val m: Member                  = member
    service.insertUser(m)
    verify(repoMock).insert(m)
