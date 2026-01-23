package seed

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.circe.parser.decode

import java.nio.file.Files
import java.nio.file.Paths

case class UserSeed(
    ref: String,
    username: String,
    email: String,
    password: String,
    role: String,
    darkMode: Option[Boolean],
    language: Option[String],
    gender: Option[String],
    birthDate: Option[String],
    interests: Option[List[String]],
    name: String,
    avatar: String,
    bio: Option[String],
    contacts: Option[List[String]]
)

object UsersSeed:
  given Decoder[UserSeed] = deriveDecoder[UserSeed]

  def loadFromJSON(path: String): Either[String, List[UserSeed]] =
    Option(Files.readAllBytes(Paths.get(path)))
      .map(bytes => new String(bytes))
      .toRight("File not found")
      .flatMap(content => decode[List[UserSeed]](content).left.map(err => s"Failed to parse JSON: $err"))
