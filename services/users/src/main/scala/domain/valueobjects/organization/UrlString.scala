package domain.valueobjects.organization

import io.circe.Decoder
import io.circe.DecodingFailure
import io.circe.Encoder
import io.circe.HCursor
import io.circe.Json

import java.net.URI

case class UrlString(value: String)

object UrlString:
  def validateUrl(raw: String): Option[UrlString] =
    if !(raw.startsWith("http://") || raw.startsWith("https://")) then
      None
    else
      try
        val uri = new URI(raw)
        if uri.getHost != null then
          Some(UrlString(uri.toString))
        else
          None
      catch
        case _: Exception => None

  given Decoder[UrlString] with
    override def apply(c: HCursor): Either[DecodingFailure, UrlString] =
      c.as[String].flatMap(raw =>
        validateUrl(raw) match
          case Some(url) => Right(url)
          case None =>
            Left(DecodingFailure(s"Invalid URL: $raw", c.history))
      )

  given Encoder[UrlString] with
    override def apply(u: UrlString): Json =
      Json.fromString(u.value)
