package model.organization

case class OrganizationAccount(
    username: String,
    email: String,
    darkMode: Boolean = false,
    language: String = "en",
    interests: Option[List[String]] = None
)
