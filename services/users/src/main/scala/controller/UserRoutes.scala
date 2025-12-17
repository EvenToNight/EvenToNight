package controller

import cask.Request
import cask.Response
import infrastructure.RabbitConnection._
import model.registration.RegistrationRequest
import model.registration.UserIdResponse
import model.registration.UserRegistration.fromRegistrationRequest
import model.registration.UserRegistration.validateRegistrationRequest
import service.AuthenticationService
import service.UserService
import upickle.default._

class UserRoutes(userService: UserService, authService: AuthenticationService) extends cask.Routes {
  @cask.get("/")
  def hello(request: cask.Request) = {
    print(request.headers)
    val message = "Hello from Scala 3!"
    channel.basicPublish("", queueName, null, message.getBytes())
    println(s"Sent message to RabbitMQ: '$message'")
    "Hello World!"
  }

  @cask.post("/register")
  def register(req: Request): Response[String] =
    val json = read[RegistrationRequest](req.text())
    validateRegistrationRequest(json) match
      case Left(err) => Response(s"Invalid registration request: $err", 400)
      case Right(_) =>
        authService.createUserWithRole(json.username, json.email, json.password, json.userType) match
          case Left(err) => Response(s"Failed to create user: $err", 500)
          case Right(keycloakId) =>
            val registeredUser = fromRegistrationRequest(json, keycloakId)
            val userId         = userService.insertUser(registeredUser)
            val jsonResponse   = UserIdResponse(userId)
            Response(write(jsonResponse), 201)

  initialize()
}
