package presentation.http.dto.response.user

import domain.valueobjects.organization.UrlString
import io.circe.Encoder
import io.circe.generic.semiauto._

case class ProfileDTO(
    name: String,
    avatar: String,
    bio: Option[String],
    contacts: Option[List[UrlString]]
)

object ProfileDTO:
  import UrlString.given
  given Encoder[ProfileDTO] = deriveEncoder[ProfileDTO].mapJson(_.dropNullValues)
