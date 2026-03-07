package domain.valueobjects.organization

import io.circe.Encoder
import io.circe.generic.semiauto._

case class OrganizationAccount(
    username: String,
    email: String,
    darkMode: Boolean = false,
    language: String = "en",
    interests: Option[List[String]] = None
)

object OrganizationAccount:
  given Encoder[OrganizationAccount] = deriveEncoder[OrganizationAccount].mapJson(_.dropNullValues)
