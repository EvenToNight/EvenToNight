package keycloak

import infrastructure.Wiring.publicKeysCache
import io.circe.Json
import io.circe.parser.decode
import sttp.client3._

import java.security.KeyFactory
import java.security.PublicKey
import java.util.Base64
import scala.util.Try

object KeycloakJwtVerifier:
  private val keycloakBaseUrl = sys.env.getOrElse("KEYCLOAK_URL", "http://localhost:8082")
  private val realm           = "eventonight"

  private def fetchJwks(): Either[String, Json] =
    val request = basicRequest
      .get(uri"$keycloakBaseUrl/realms/$realm/protocol/openid-connect/certs")
      .response(asStringAlways)

    Try(request.send(HttpURLConnectionBackend())).toEither.left.map(_.getMessage).flatMap(response =>
      decode[Json](response.body).left.map(_.getMessage)
    )

  private def rsaPublicKeyFromModulusExponent(nB64: String, eB64: String): Either[String, PublicKey] =
    Try {
      val nBytes   = Base64.getUrlDecoder.decode(nB64)
      val eBytes   = Base64.getUrlDecoder.decode(eB64)
      val modulus  = new java.math.BigInteger(1, nBytes)
      val exponent = new java.math.BigInteger(1, eBytes)
      val spec     = new java.security.spec.RSAPublicKeySpec(modulus, exponent)
      val kf       = KeyFactory.getInstance("RSA")
      kf.generatePublic(spec)
    }.toEither.left.map(_.getMessage)

  private def replaceCache(newKeysMap: Map[String, PublicKey]): Unit =
    publicKeysCache.clear()
    publicKeysCache ++= newKeysMap

  def refreshPublicKeys(): Either[String, Json] =
    for
      jwks <- fetchJwks()
      keys = jwks.hcursor.downField("keys").values.getOrElse(Vector())
      newKeysMap =
        keys.flatMap(keyJson =>
          val cursor = keyJson.hcursor
          for
            kid <- cursor.get[String]("kid").toOption
            n   <- cursor.get[String]("n").toOption
            e   <- cursor.get[String]("e").toOption
            pk  <- rsaPublicKeyFromModulusExponent(n, e).toOption
          yield kid -> pk
        ).toMap
      _ = replaceCache(newKeysMap)
    yield Json.obj(
      "keys" -> Json.fromValues(
        newKeysMap.map { case (kid, pk) =>
          Json.obj(
            "kid"       -> Json.fromString(kid),
            "publicKey" -> Json.fromString(Base64.getEncoder.encodeToString(pk.getEncoded))
          )
        }
      )
    )
