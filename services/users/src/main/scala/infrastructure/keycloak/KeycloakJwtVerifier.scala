package infrastructure.keycloak

import infrastructure.Wiring.publicKeysCache
import io.circe.Json
import io.circe.parser.decode
import io.circe.parser.parse
import pdi.jwt.Jwt
import pdi.jwt.JwtAlgorithm
import pdi.jwt.JwtClaim
import pdi.jwt.exceptions._
import sttp.client3._

import java.security.KeyFactory
import java.security.PublicKey
import java.util.Base64
import scala.util.Failure
import scala.util.Success
import scala.util.Try

import KeycloakConfig.oidcBaseUri

object KeycloakJwtVerifier:
  private def fetchJwks(): Either[String, Json] =
    val jwksUri = oidcBaseUri.addPath("certs")
    val request = basicRequest
      .get(jwksUri)
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

  private def extractKidFromHeader(accessToken: String): Either[String, String] =
    accessToken.split("\\.") match
      case Array(headerB64, _, _) =>
        Try(new String(Base64.getUrlDecoder.decode(headerB64))).toEither.left.map(_ =>
          "Invalid JWT header encoding"
        ).flatMap(headerJson =>
          parse(headerJson).left.map(_ => "Invalid JWT header JSON").flatMap(json =>
            json.hcursor.get[String]("kid").left.map(_ => "Missing 'kid' in JWT header")
          )
        )
      case _ => Left("Invalid JWT format")

  private def decodeWithKey(accessToken: String, pk: PublicKey): Either[String, JwtClaim] =
    Jwt.decode(accessToken, pk, Seq(JwtAlgorithm.RS256)) match
      case Success(claim) => Right(claim)
      case Failure(ex) =>
        ex match
          case _: JwtValidationException => Left("Signature not verified")
          case _: JwtExpirationException => Left("Token expired")
          case _                         => Left("Invalid token")

  def verifyToken(accessToken: String): Either[String, JwtClaim] =
    extractKidFromHeader(accessToken).flatMap(kid =>
      publicKeysCache.get(kid) match
        case Some(pk) => decodeWithKey(accessToken, pk)
        case None =>
          refreshPublicKeys().flatMap(_ =>
            publicKeysCache.get(kid) match
              case Some(pk) => decodeWithKey(accessToken, pk)
              case None     => Left("Unauthorized")
          )
    )

  private def extractClaimFromPayload(payload: JwtClaim, claim: String): Either[String, String] =
    claim match
      case "sub" =>
        payload.subject.toRight("Missing 'sub' claim in token")
      case other =>
        parse(payload.content)
          .left.map(_.getMessage)
          .flatMap(_.hcursor.get[String](other)).left.map(_ => s"Missing '$claim' claim in token")

  def extractUserId(payload: JwtClaim): Either[String, String] = extractClaimFromPayload(payload, "user_id")

  def extractSub(payload: JwtClaim): Either[String, String] = extractClaimFromPayload(payload, "sub")

  def authorizeUser(payload: JwtClaim, userId: String): Either[String, Unit] =
    for
      userIdFromToken <- extractUserId(payload)
      _ <- if userIdFromToken == userId then Right(())
      else Left("Forbidden: userId does not match 'user_id' token claim")
    yield ()
