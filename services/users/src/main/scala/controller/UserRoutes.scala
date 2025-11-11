package controller

import infrastructure.RabbitConnection._
import service.UserService

class UserRoutes(userService: UserService) extends cask.Routes {
  @cask.get("/")
  def hello(request: cask.Request) = {
    print(request.headers)
    val message = "Hello from Scala 3!"
    channel.basicPublish("", queueName, null, message.getBytes())
    println(s"Sent message to RabbitMQ: '$message'")
    "Hello World!"
  }

  @cask.get("/users")
  def createUser(): String = {
    val memberId: String        = "b07bfb2c-45f8-4f51-b6a8-c29d7895f53d"
    val memberEmail: String     = "bobsmith@test.com"
    val memberAccountId: String = memberId
    val memberNickname: String  = "bobo"
    import model.*
    import model.member.*
    val member: Member = Member(MemberAccount(memberId, memberEmail), MemberProfile(memberAccountId, memberNickname))
    userService.insertUser(member)
    val orgId: String        = "7e63d360-5e3d-4b33-8c9a-a8c2d773db2c"
    val orgEmail: String     = "info@meet.com"
    val orgAccountId: String = orgId
    val orgNickname: String  = "Meet"
    import model.organization.*
    val organization: Organization =
      Organization(OrganizationAccount(orgId, orgEmail), OrganizationProfile(orgAccountId, orgNickname))
    userService.insertUser(organization)
    "Users inserted"
  }

  initialize()
}
