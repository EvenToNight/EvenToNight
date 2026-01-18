package controller

import api.dto.request.UpdatePasswordRequestDTO
import api.dto.request.UpdateUserRequestDTO
import api.mappers.UserMappers.toUserDTO
import api.utils.RequestParser.parseRequestBody
import cask.Request
import cask.Response
import http.AuthHeaderExtractor
import infrastructure.keycloak.KeycloakJwtVerifier.authorizeUser
import infrastructure.keycloak.KeycloakJwtVerifier.extractSub
import infrastructure.keycloak.KeycloakJwtVerifier.verifyToken
import infrastructure.rabbitmq.EventPublisher
import io.circe.Json
import io.circe.syntax._
import model.Member
import model.Organization
import model.events.UserDeleted
import model.events.UserUpdated
import model.member.MemberUpdate
import model.organization.OrganizationUpdate
import service.AuthenticationService
import service.UserService

class UserRoutes(authService: AuthenticationService, userService: UserService, eventPublisher: EventPublisher)
    extends cask.Routes {
  @cask.get("/:userId")
  def getUser(userId: String, req: Request): Response[String] =
    userService.getUserById(userId) match
      case Left(err) => Response(err, 404)
      case Right(role, user) =>
        val isOwner: Boolean =
          (
            for
              userAccessToken <- AuthHeaderExtractor.extractBearer(req)
              payload         <- verifyToken(userAccessToken)
              _               <- authorizeUser(payload, userId)
            yield ()
          ).isRight
        val json = if isOwner then
          user match
            case m: Member =>
              Json.obj(
                "role"    -> Json.fromString(role),
                "account" -> m.account.asJson,
                "profile" -> m.profile.asJson
              )
            case o: Organization =>
              Json.obj(
                "role"    -> Json.fromString(role),
                "account" -> o.account.asJson,
                "profile" -> o.profile.asJson
              )
        else
          user.toUserDTO(role).asJson
        Response(json.spaces2, 200, Seq("Content-Type" -> "application/json"))

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
        payload         <- verifyToken(userAccessToken)
        _               <- authorizeUser(payload, userId)
        keycloakId      <- extractSub(payload)
        _               <- authService.deleteUser(keycloakId)
      yield ()
    ) match
      case Right(_) =>
        eventPublisher.publish(UserDeleted(userId))
        Response("", 204)
      case Left(err) => Response(err, 400)

  @cask.put("/:userId")
  def updateUser(userId: String, req: Request): Response[String] =
    userService.getUserById(userId) match
      case Left(err) => Response(err, 404)
      case Right((_, user)) =>
        (
          for
            userAccessToken <- AuthHeaderExtractor.extractBearer(req)
            payload         <- verifyToken(userAccessToken)
            _               <- authorizeUser(payload, userId)

            dto <- parseRequestBody[UpdateUserRequestDTO](req)
            updatedUser <- Right(user match
              case m: Member       => MemberUpdate.updateFromDTO(m, dto)
              case o: Organization => OrganizationUpdate.updateFromDTO(o, dto))
            _ <- userService.updateUser(updatedUser, userId)
          yield updatedUser
        ) match
          case Right(updatedUser) =>
            updatedUser match
              case m: Member =>
                eventPublisher.publish(UserUpdated(
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
                eventPublisher.publish(UserUpdated(
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
            Response("", 204)
          case Left(err) => Response(err, 400)

  @cask.put("/:userId/password")
  def updatePassword(userId: String, req: Request): Response[String] =
    (
      for
        token   <- AuthHeaderExtractor.extractBearer(req)
        payload <- verifyToken(token)
        _       <- authorizeUser(payload, userId)

        dto <- parseRequestBody[UpdatePasswordRequestDTO](req)
        _ <- if dto.newPassword == dto.confirmPassword then Right(())
        else Left("Passwords do not match")
        keycloakId <- extractSub(payload)
        _          <- authService.updatePassword(keycloakId, dto.newPassword)
      yield ()
    ) match
      case Right(_)  => Response("", 204)
      case Left(err) => Response(err, 400)

  initialize()
}
