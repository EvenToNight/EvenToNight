package domain.valueobjects.member

import io.circe.Decoder
import io.circe.Encoder

enum Gender:
  case Male
  case Female

object Gender:
  given Decoder[Gender] = Decoder.decodeString.emap {
    case "male"   => Right(Male)
    case "female" => Right(Female)
    case other    => Left(s"Invalid gender: $other")
  }
  given Encoder[Gender] = Encoder.encodeString.contramap {
    case Male   => "male"
    case Female => "female"
  }
