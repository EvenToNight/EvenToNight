package api.utils

import cask.Request
import cats.syntax.all._
import io.circe.Decoder
import io.circe.DecodingFailure
import io.circe.parser.decodeAccumulating

object RequestParser:
  def parseRequestBody[T: Decoder](request: Request): Either[String, T] =
    decodeAccumulating[T](request.text())
      .toEither
      .leftMap { errors =>
        errors.toList.map {
          case failure: DecodingFailure =>
            failure.message
          case other =>
            s"Unexpected error: ${other.getMessage}"
        }.mkString("; ")
      }
