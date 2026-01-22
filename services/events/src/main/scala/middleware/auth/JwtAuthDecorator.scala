package middleware.auth

import cask.Response
import cask.model.Request as CaskRequest
import cask.router.Result

class JwtAuthDecorator extends cask.RawDecorator:
  override def wrapFunction(
      ctx: CaskRequest,
      delegate: (CaskRequest, Map[String, Any]) => Result[Response.Raw]
  ): Result[Response.Raw] =
    val tokenOpt: Option[String] = ctx.headers
      .get("authorization")
      .flatMap(_.headOption)
      .flatMap { auth =>
        if auth.startsWith("Bearer ") then Some(auth.drop(7)) else None
      }

    tokenOpt match
      case Some(token) =>
        JwtService.validateToken(token) match
          case Right(authenticatedUser) =>
            delegate(ctx, Map("user" -> authenticatedUser))

          case Left(errorMsg) =>
            Result.Success(
              Response(
                ujson.Obj("error" -> "Invalid token", "message" -> errorMsg),
                statusCode = 401,
                headers = Seq("WWW-Authenticate" -> "Bearer")
              )
            )

      case None =>
        Result.Success(
          Response(
            ujson.Obj("error" -> "No token provided"),
            statusCode = 401,
            headers = Seq("WWW-Authenticate" -> "Bearer")
          )
        )
