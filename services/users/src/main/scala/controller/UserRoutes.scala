package controller

import api.dto.request.UpdatePasswordRequestDTO
import api.dto.request.UpdateUserRequestDTO
import api.dto.request.query.SearchUsersQueryDTO
import api.dto.response.AvatarResponseDTO
import api.dto.response.query.PaginatedResponse
import api.mappers.UserMappers.toUserDTO
import api.utils.RequestParser.parseRequestBody
import api.utils.UserQueryParser
import cask.FormFile
import cask.Request
import cask.Response
import http.HttpSecurity.authenticateAndAuthorize
import infrastructure.Wiring.mediaBaseUrl
import infrastructure.keycloak.KeycloakJwtVerifier.extractSub
import infrastructure.media.MediaServiceClient.deleteAvatarFromMediaService
import infrastructure.media.MediaServiceClient.uploadAvatarToMediaService
import infrastructure.rabbitmq.EventPublisher
import io.circe.Json
import io.circe.generic.auto._
import io.circe.syntax._
import model.Member
import model.Organization
import model.RegisteredUser
import model.events.UserDeleted
import model.events.UserUpdated
import model.member.MemberUpdate
import model.organization.OrganizationUpdate
import service.AuthenticationService
import service.UserQueryService
import service.UserService

class UserRoutes(
    authService: AuthenticationService,
    userService: UserService,
    userQueryService: UserQueryService,
    eventPublisher: EventPublisher
) extends cask.Routes {
  @cask.get("/:userId")
  def getUser(userId: String, req: Request): Response[String] =
    userService.getUserById(userId) match
      case Left(err) => Response(err, 404)
      case Right(role, user) =>
        val isOwner: Boolean = authenticateAndAuthorize(req, userId).isRight
        val json = if isOwner then
          user match
            case m: Member =>
              Json.obj(
                "id"      -> Json.fromString(userId),
                "role"    -> Json.fromString(role),
                "account" -> m.account.asJson,
                "profile" -> m.profile.asJson
              )
            case o: Organization =>
              Json.obj(
                "id"      -> Json.fromString(userId),
                "role"    -> Json.fromString(role),
                "account" -> o.account.asJson,
                "profile" -> o.profile.asJson
              )
        else
          user.toUserDTO(userId, role).asJson
        Response(json.spaces2, 200, Seq("Content-Type" -> "application/json"))

  @cask.get("/")
  def getAllUsers(): Response[String] =
    userService.getUsers() match
      case Left(err) => Response(err, 400)
      case Right(users) =>
        val dtoList = users.map { case (role, userId, user) =>
          user.toUserDTO(userId, role)
        }
        Response(dtoList.asJson.spaces2, 200, Seq("Content-Type" -> "application/json"))

  @cask.delete("/:userId")
  def deleteUser(userId: String, req: Request): Response[String] =
    (
      for
        payload    <- authenticateAndAuthorize(req, userId)
        keycloakId <- extractSub(payload)
        _          <- authService.deleteUser(keycloakId)
        _          <- userService.deleteUser(userId)
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
        val result: Either[String, RegisteredUser] =
          for
            _ <- authenticateAndAuthorize(req, userId)

            dto <- parseRequestBody[UpdateUserRequestDTO](req)
            updatedUser <- user match
              case m: Member       => MemberUpdate.updateFromDTO(m, dto)
              case o: Organization => OrganizationUpdate.updateFromDTO(o, dto)
            _ <- userService.updateUser(updatedUser, userId)
          yield updatedUser
        result match
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

  @cask.postForm("/:userId")
  def updateAvatar(userId: String, req: Request, avatar: FormFile = null): Response[String] =
    authenticateAndAuthorize(req, userId) match
      case Left(err) => Response(err, 401)
      case Right(_) =>
        val avatarOpt: Option[FormFile] = Option(avatar)

        userService.getUserById(userId) match
          case Left(err) => Response(err, 404)
          case Right((_, user)) =>
            val avatarUrl = uploadAvatarToMediaService(userId, avatarOpt)

            val updatedUser = user match
              case m: Member =>
                Member(m.account, m.profile.copy(avatar = avatarUrl))
              case o: Organization =>
                Organization(o.account, o.profile.copy(avatar = avatarUrl))

            userService.updateUser(updatedUser, userId) match
              case Left(err) => Response(err, 400)
              case Right(_) =>
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
                Response(
                  AvatarResponseDTO(userId, avatarUrl).asJson.spaces2,
                  200,
                  Seq("Content-Type" -> "application/json")
                )

  @cask.delete("/:userId/avatar")
  def deleteAvatar(userId: String, req: Request): Response[String] =
    val defaultAvatar = s"http://${mediaBaseUrl}/users/default.png"
    (
      for
        _           <- authenticateAndAuthorize(req, userId)
        _           <- deleteAvatarFromMediaService(userId)
        updatedUser <- userService.updateAvatar(userId, defaultAvatar)
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
        payload <- authenticateAndAuthorize(req, userId)

        dto <- parseRequestBody[UpdatePasswordRequestDTO](req)
        _ <- if dto.newPassword == dto.confirmPassword then Right(())
        else Left("New password and confirm password do not match")

        (_, user) <- userService.getUserById(userId)
        username = user match
          case m: Member       => m.account.username
          case o: Organization => o.account.username

        keycloakId <- extractSub(payload)
        _          <- authService.updatePassword(username, keycloakId, dto.currentPassword, dto.newPassword)
      yield ()
    ) match
      case Right(_)  => Response("", 204)
      case Left(err) => Response(err, 400)

  @cask.get("/search")
  def searchUsers(
      role: Option[String] = None,
      prefix: Option[String] = None,
      limit: Option[Int] = None,
      offset: Option[Int] = None
  ): Response[String] =
    val dto = SearchUsersQueryDTO(role, prefix, limit, offset)
    UserQueryParser.parse(dto) match
      case Left(err) =>
        Response(err.mkString(", "), 400)

      case Right(query) =>
        userQueryService.searchUsers(query) match
          case Left(err) =>
            Response(err.mkString(", "), 500)

          case Right((users, hasMore)) =>
            val response =
              PaginatedResponse(
                users.map(_.asJson),
                query.limit,
                query.offset,
                hasMore
              )
            Response(response.asJson.spaces2, 200)

  initialize()
}
