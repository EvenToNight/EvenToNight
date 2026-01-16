package controller

import api.mappers.UserMappers.toUserDTO
import cask.Response
import io.circe.syntax._
import service.UserService

class UserRoutes(userService: UserService) extends cask.Routes {
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

  initialize()
}
