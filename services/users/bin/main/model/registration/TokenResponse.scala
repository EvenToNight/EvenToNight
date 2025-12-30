package model.registration

import upickle.default.Writer
import upickle.default.macroW

case class TokenResponse(token: String)

object TokenResponse:
  given Writer[TokenResponse] = macroW
