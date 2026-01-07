package controller

import cask.Request
import cask.Response
import keycloak.KeycloakJwtVerifier.refreshPublicKeys
import model.LoginValidation._
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
    parseLoginRequest(req) match
      case Left(err) => Response(err, 400)
      case Right(loginReq) =>
        validateLoginRequest(loginReq) match
          case Left(err) => Response(err, 400)
          case Right(validLoginReq) =>
            authService.login(validLoginReq.usernameOrEmail, validLoginReq.password) match
              case Left("Invalid credentials") => Response("Login failed: invalid credentials", 401)
              case Left("Client not allowed")  => Response("Login failed: client not allowed", 403)
              case Left(err)                   => Response(s"Login failed: $err", 500)
              case Right(token)                => Response(write(TokenResponse(token)), 200)

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

  @cask.get("/publicKeys")
  def getPublicKeys(): Response[String] =
    refreshPublicKeys() match
      case Left(_) => Response("Failed to refresh public keys", 500)
      case Right(json) =>
        Response(json.noSpaces, 200)

  initialize()
}
