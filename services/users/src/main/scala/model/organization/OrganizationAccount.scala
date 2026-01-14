package model.organization

case class OrganizationAccount(
    username: String,
    email: String,
    darkMode: Boolean = false,
    language: String = "EN",
    interests: Option[List[String]] = None
)
