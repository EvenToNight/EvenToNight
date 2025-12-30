package controller

import cask.Request
import cask.Response
import infrastructure.RabbitConnection._
import model.registration.TokenResponse
import model.registration.UserRegistration._
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
    parseInput(req) match
      case Left(err) => Response(err, 400)
      case Right(inputReq) =>
        validateRegistrationRequest(inputReq) match
          case Left(err) => Response(err, 400)
          case Right(validReq) =>
            authService.createUserWithRole(validReq) match
              case Left(err) => Response(s"Failed to create user: $err", 500)
              case Right(keycloakId, userId) =>
                val registeredUser = fromValidRegistration(validReq, keycloakId)
                userService.insertUser(registeredUser, userId)

                authService.login(validReq.username, validReq.password) match
                  case Left(err) => Response(s"User created but login failed: $err", 500)
                  case Right(token) =>
                    Response(write(TokenResponse(token)), 201)

  initialize()
}
