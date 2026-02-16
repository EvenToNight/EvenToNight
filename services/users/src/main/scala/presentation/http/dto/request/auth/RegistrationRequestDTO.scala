package presentation.http.dto.request.auth

import io.circe.Decoder
import io.circe.DecodingFailure
import io.circe.HCursor

case class RegistrationRequestDTO(
    username: String,
    email: String,
    password: String,
    role: String
)

object RegistrationRequestDTO:
  private def requiredField(c: HCursor, name: String): Decoder.Result[String] =
    c.downField(name).as[Option[String]].flatMap {
      case Some(v) if v.trim.nonEmpty => Right(v.trim)
      case Some(_)                    => Left(DecodingFailure(s"Invalid $name", c.history))
      case None                       => Left(DecodingFailure(s"$name is missing", c.history))
    }

  private def validateRole(role: String): Either[String, String] =
    role match
      case "member" | "organization" => Right(role)
      case _                         => Left(s"Invalid role: $role")

  given Decoder[RegistrationRequestDTO] with
    override def apply(c: HCursor): Decoder.Result[RegistrationRequestDTO] =
      for
        username <- requiredField(c, "username")
        email    <- requiredField(c, "email")
        password <- requiredField(c, "password")
        roleRaw  <- requiredField(c, "role")
        role     <- validateRole(roleRaw).left.map(DecodingFailure(_, c.history))
      yield RegistrationRequestDTO(username, email, password, role)
