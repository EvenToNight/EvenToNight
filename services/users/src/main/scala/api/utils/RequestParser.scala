package api.utils

import cask.Request
import io.circe.Decoder
import io.circe.parser.decode

object RequestParser:
  def parseRequestBody[T: Decoder](request: Request): Either[String, T] =
    decode[T](request.text()).left.map(_ => "Invalid JSON")
