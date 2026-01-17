package controller

import api.mappers.UserMappers.toUserDTO
import cask.Request
import cask.Response
import http.AuthHeaderExtractor
import infrastructure.keycloak.KeycloakJwtVerifier.authorizeUser
import infrastructure.keycloak.KeycloakJwtVerifier.extractSub
import infrastructure.rabbitmq.EventPublisher
import io.circe.syntax._
import model.events.UserDeleted
import service.AuthenticationService
import service.UserService

class UserRoutes(authService: AuthenticationService, userService: UserService, eventPublisher: EventPublisher)
    extends cask.Routes {
  @cask.get("/:userId")
  def getUser(userId: String): Response[String] =
    userService.getUserById(userId) match
      case Left(err) => Response(err, 404)
      case Right(role, user) =>
        val dto = user.toUserDTO(role)
        Response(dto.asJson.spaces2, 200, Seq("Content-Type" -> "application/json"))

  @cask.get("/")
  def getAllUsers(): Response[String] =
    userService.getUsers() match
      case Left(err) => Response(err, 400)
      case Right(users) =>
        val dtoList = users.map { case (role, user) =>
          user.toUserDTO(role)
        }
        Response(dtoList.asJson.spaces2, 200, Seq("Content-Type" -> "application/json"))

  @cask.delete("/:userId")
  def deleteUser(userId: String, req: Request): Response[String] =
    (
      for
        userAccessToken <- AuthHeaderExtractor.extractBearer(req)
        _               <- authorizeUser(userAccessToken, userId)
        sub             <- extractSub(userAccessToken)
        _               <- authService.deleteUser(sub)
      yield ()
    ) match
      case Right(_) =>
        eventPublisher.publish(UserDeleted(userId))
        Response("", 204)
      case Left(err) => Response(err, 400)

  initialize()
}
