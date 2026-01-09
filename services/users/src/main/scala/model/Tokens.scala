package model

import upickle.default.Writer
import upickle.default.macroW

case class Tokens(accessToken: String, refreshToken: String)

object Tokens:
  given Writer[Tokens] = macroW
