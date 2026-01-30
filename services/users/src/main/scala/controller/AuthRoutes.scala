package controller

import api.mappers.TokenMappers.toTokensDTO
import api.mappers.UserMappers.toLoginDTO
import cask.Request
import cask.Response
import infrastructure.keycloak.KeycloakJwtVerifier.extractUserId
import infrastructure.keycloak.KeycloakJwtVerifier.refreshPublicKeys
import infrastructure.keycloak.KeycloakJwtVerifier.verifyToken
import infrastructure.rabbitmq.EventPublisher
import io.circe.syntax._
import model.LoginValidation._
import model.LogoutRequestParser.parseLogoutRequest
import model.Member
import model.Organization
import model.TokenRefresh.parseRefreshRequest
import model.events.UserCreated
import model.registration.UserRegistration._
import service.AuthenticationService
import service.UserService

class AuthRoutes(authService: AuthenticationService, userService: UserService, eventPublisher: EventPublisher)
    extends cask.Routes {
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
              case Right(userTokens) =>
                verifyToken(userTokens.accessToken) match
                  case Left(err) => Response(s"Failed to verify token: $err", 500)
                  case Right(payload) =>
                    extractUserId(payload) match
                      case Left(err) => Response(s"Failed to extract userId: $err", 500)
                      case Right(userId) =>
                        userService.getUserById(userId) match
                          case Left(err) => Response(err, 404)
                          case Right(role, user) =>
                            val dto = user.toLoginDTO(userId, userTokens, role)
                            Response(dto.asJson.spaces2, 200, Seq("Content-Type" -> "application/json"))

  @cask.post("/register")
  def register(req: Request): Response[String] =
    parseInput(req) match
      case Left(err) => Response(err, 400)
      case Right(inputReq) =>
        validateRegistrationRequest(inputReq) match
          case Left(err) => Response(err, 400)
          case Right(validReq) =>
            authService.createUserWithRole(validReq) match
              case Left(err) if err.startsWith("Password not compliant")    => Response(err, 400)
              case Left(err) if err.startsWith("Bad request from Keycloak") => Response(err, 400)
              case Left(err) => Response(s"Failed to create user: $err", 500)
              case Right(userId) =>
                val registeredUser = fromValidRegistration(validReq)
                userService.insertUser(registeredUser, userId)
                registeredUser match {
                  case m: Member =>
                    eventPublisher.publish(UserCreated(
                      id = userId,
                      username = m.account.username,
                      name = m.profile.name,
                      email = m.account.email,
                      avatar = m.profile.avatar,
                      bio = m.profile.bio,
                      interests = m.account.interests,
                      language = m.account.language,
                      role = "member"
                    ))
                  case o: Organization =>
                    eventPublisher.publish(UserCreated(
                      id = userId,
                      username = o.account.username,
                      name = o.profile.name,
                      email = o.account.email,
                      avatar = o.profile.avatar,
                      bio = o.profile.bio,
                      interests = o.account.interests,
                      language = o.account.language,
                      role = "organization"
                    ))
                }

                authService.login(validReq.username, validReq.password) match
                  case Left(err) => Response(s"User created but login failed: $err", 500)
                  case Right(userTokens) =>
                    val dto = registeredUser.toLoginDTO(userId, userTokens, validReq.role)
                    Response(dto.asJson.spaces2, 201, Seq("Content-Type" -> "application/json"))

  @cask.post("/refresh")
  def refreshTokens(req: Request): Response[String] =
    parseRefreshRequest(req) match
      case Left(err) => Response(err, 400)
      case Right(refreshReq) =>
        authService.refresh(refreshReq.refreshToken) match
          case Left(err) => Response(s"Token refresh failed: $err", 401)
          case Right(userTokens) =>
            val dto = userTokens.toTokensDTO
            Response(dto.asJson.spaces2, 200, Seq("Content-Type" -> "application/json"))

  @cask.post("/logout")
  def logout(req: Request): Response[String] =
    parseLogoutRequest(req) match
      case Left(err) => Response(err, 400)
      case Right(logoutReq) =>
        authService.logoutLocal(logoutReq.refreshToken) match
          case Left(err) => Response(s"Logout failed: $err", 500)
          case Right(_)  => Response("", 204)

  @cask.get("/public-keys")
  def getPublicKeys(): Response[String] =
    refreshPublicKeys() match
      case Left(_) => Response("Failed to refresh public keys", 500)
      case Right(json) =>
        Response(json.spaces2, 200, Seq("Content-Type" -> "application/json"))

  initialize()
}
