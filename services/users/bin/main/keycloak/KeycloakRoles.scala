package keycloak

import infrastructure.KeycloakConnection
import io.circe.parser.parse

object KeycloakRoles:
  private var _roleIds: Map[String, String] = Map.empty
  def roleIds: Map[String, String]          = _roleIds

  private val requiredRoles = Set("member", "organization")

  private def parseAndFilterRoles(jsonStr: String): Either[String, Map[String, String]] =
    parse(jsonStr) match
      case Left(err) => Left(s"Invalid JSON: ${err.getMessage}")
      case Right(json) =>
        val parsed: Map[String, String] = json.asArray match
          case None => Map.empty
          case Some(rolesArray) =>
            rolesArray.flatMap(roleJson =>
              for
                name <- roleJson.hcursor.get[String]("name").toOption
                id   <- roleJson.hcursor.get[String]("id").toOption
              yield name -> id
            ).toMap

        val filtered = parsed.filter { case (name, _) => requiredRoles.contains(name) }
        val missing  = requiredRoles.diff(filtered.keySet)
        if missing.nonEmpty then
          Left(s"Missing required roles in Keycloak: ${missing.mkString(", ")}")
        else
          Right(filtered)

  def initRoles(kc: KeycloakConnection): Either[String, Unit] =
    for
      rolesJson     <- kc.getRoles()
      filteredRoles <- parseAndFilterRoles(rolesJson)
    yield _roleIds = filteredRoles
