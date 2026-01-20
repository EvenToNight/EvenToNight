package http

import cask.Request

object AuthHeaderExtractor:
  def extractBearer(request: Request): Either[String, String] =
    request.headers
      .get("authorization")
      .flatMap(_.headOption)
      .toRight("Missing Authorization header")
      .flatMap(auth =>
        if auth.startsWith("Bearer ") then
          Right(auth.stripPrefix("Bearer ").trim)
        else
          Left("Invalid Authorization header format")
      )
