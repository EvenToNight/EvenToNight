package infrastructure.keycloak

import JsonUtils.parseJson

object KeycloakRoles:
  private val requiredRoles = Set("member", "organization")

  def parseAndFilterRoles(jsonStr: String): Either[String, Map[String, String]] =
    parseJson(jsonStr).flatMap(json =>
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
    )
