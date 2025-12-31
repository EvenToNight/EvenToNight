package controller

import cask.Request
import cask.Response
import model.UsersConversions.asJson
import model.registration.TokenResponse
import model.registration.UserRegistration._
import service.AuthenticationService
import service.UserService
import ujson.Value
import upickle.default._

class UserRoutes(userService: UserService, authService: AuthenticationService) extends cask.Routes {
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

  @cask.post("/login")
  def login(req: Request): Response[String] =
    parseInput(req) match
      case Left(err) => Response(err, 400)
      case Right(loginReq) =>
        authService.login(loginReq.username.getOrElse(""), loginReq.password.getOrElse("")) match
          case Left(err) => Response(s"Login failed: $err", 401)
          case Right(token) =>
            Response(write(TokenResponse(token)), 200)

  @cask.get("/:userId")
  def getUser(userId: String): Response[Value] =
    userService.getUserById(userId) match
      case Left(err)   => Response(err, 404)
      case Right(user) => Response(user.asJson, 200)

  @cask.get("/")
  def getAllUsers(): Response[Value] =
    userService.getUsers() match
      case Left(err)    => Response(err, 400)
      case Right(users) => Response(users.map(user => user.asJson), 200)

  initialize()
}
