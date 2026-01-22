import middleware.auth.{AuthUser, PublicKeyEntry}
import pdi.jwt.{Jwt, JwtAlgorithm}

import java.util.Base64
import scala.util.Try

object JwtService:
  private var publicKeys: Seq[PublicKeyEntry] = Seq.empty
  private var fallbackKey: Option[String]     = None
  private val isDevelopment                   = sys.env.getOrElse("NODE_ENV", "production") == "development"

  // Inizializza le chiavi pubbliche all'avvio - restituisce Either invece di throw
  def initialize(): Either[String, Unit] =
    val publicKeyUrl = sys.env.get("AUTH_PUBLIC_KEY_URL")

    if isDevelopment || publicKeyUrl.isEmpty then
      println("⚠️  Development mode or AUTH_PUBLIC_KEY_URL not set, using fallback key")
      fallbackKey = Some(sys.env.getOrElse("JWT_SECRET", "dev-secret-key"))
      Right(())
    else
      loadPublicKeys(publicKeyUrl.get) match
        case Right(_) =>
          println(s"✓ Loaded ${publicKeys.length} public key(s)")
          Right(())
        case Left(error) =>
          println(s"✗ Failed to load public keys: $error")
          Left(error)

  private def loadPublicKeys(url: String): Either[String, Unit] =
    Try {
      val response = requests.get(url)

      if response.statusCode != 200 then
        Left(s"Failed to fetch public keys: ${response.statusCode}")
      else
        val data = ujson.read(response.text())
        val keys = data("keys").arr.map { key =>
          PublicKeyEntry(
            kid = key("kid").str,
            pem = s"-----BEGIN PUBLIC KEY-----\n${key("publicKey").str}\n-----END PUBLIC KEY-----"
          )
        }

        if keys.isEmpty then
          Left("No public keys found in response")
        else
          publicKeys = keys.toSeq
          Right(())
    }.toEither.left.map(_.getMessage).flatten

  def refreshPublicKeys(): Either[String, Unit] =
    sys.env.get("AUTH_PUBLIC_KEY_URL") match
      case Some(url) =>
        loadPublicKeys(url).left.map { error =>
          println(s"⚠️  Failed to refresh keys: $error")
          error
        }
      case None => Right(())

  private def extractKidFromToken(token: String): Option[String] =
    Try {
      val parts = token.split("\\.")
      if parts.length >= 2 then
        val headerJson = new String(Base64.getUrlDecoder.decode(parts(0)))
        val header     = ujson.read(headerJson)
        header.obj.get("kid").map(_.str)
      else
        None
    }.toOption.flatten

  private def getKeyForToken(token: String): Option[String] =
    if isDevelopment then
      fallbackKey
    else
      val kidOpt = extractKidFromToken(token)

      kidOpt match
        case Some(kid) =>
          publicKeys.find(_.kid == kid).map(_.pem).orElse {
            println(s"Key with kid $kid not found, refreshing keys...")
            refreshPublicKeys()
            publicKeys.find(_.kid == kid).map(_.pem)
              .orElse(publicKeys.headOption.map(_.pem))
          }
        case None =>
          publicKeys.headOption.map(_.pem)

  def validateToken(token: String): Either[String, AuthUser] =
    if isDevelopment then
      // In development, decode senza validare la firma
      Try {
        val parts       = token.split("\\.")
        val payloadJson = new String(Base64.getUrlDecoder.decode(parts(1)))
        val payload     = ujson.read(payloadJson)
        AuthUser(userId = payload("user_id").str)
      }.toEither.left.map(_.getMessage)
    else
      getKeyForToken(token) match
        case Some(key) =>
          Jwt.decode(token, key, Seq(JwtAlgorithm.RS256))
            .map { claim =>
              val payload = ujson.read(claim.content)
              AuthUser(userId = payload("user_id").str)
            }
            .toEither
            .left.map(_.getMessage)
        case None =>
          Left("No matching public key found for token")
