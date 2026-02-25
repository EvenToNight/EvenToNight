package presentation.http.dto.request.auth

import io.circe.Decoder
import io.circe.DecodingFailure
import io.circe.HCursor

case class LoginRequestDTO(username: String, password: String)

object LoginRequestDTO:
  given Decoder[LoginRequestDTO] with
    override def apply(c: HCursor): Either[DecodingFailure, LoginRequestDTO] =
      for
        username <- c.downField("username").as[Option[String]].flatMap {
          case Some(value) => Right(value)
          case None        => Left(DecodingFailure("Missing required field: username", c.history))
        }
        password <- c.downField("password").as[Option[String]].flatMap {
          case Some(value) => Right(value)
          case None        => Left(DecodingFailure("Missing required field: password", c.history))
        }
      yield LoginRequestDTO(username, password)
