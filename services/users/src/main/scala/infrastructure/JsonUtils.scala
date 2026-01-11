package infrastructure

import io.circe.Json
import io.circe.parser.parse

object JsonUtils:
  def parseJson(body: String): Either[String, Json] =
    parse(body).left.map(err => s"Invalid JSON: ${err.getMessage}")
