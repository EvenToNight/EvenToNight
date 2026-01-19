package unit.infrastructure.keycloak

import infrastructure.keycloak.KeycloakConnection
import io.circe.Json
import sttp.client3.Response
import sttp.client3.testing.SttpBackendStub
import sttp.model.StatusCode

object TestHelpers:
  val tokenPath                      = List("realms", "eventonight", "protocol", "openid-connect", "token")
  val testSecret                     = "test-secret"
  val testClientId                   = "test-client-id"
  val dummyForm: Map[String, String] = Map.empty

  def stubbedConnectionWithStatusCodeAndBody(code: StatusCode, body: String) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond(Response(body, code))
    new KeycloakConnection(backendStub)

  def stubbedConnectionWithStatusCodeAndJson(code: StatusCode, json: Json) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond(Response(json.noSpaces, code))
    new KeycloakConnection(backendStub)
