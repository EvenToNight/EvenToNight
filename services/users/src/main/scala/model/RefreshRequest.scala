package model

import upickle.default.Reader
import upickle.default.macroR

case class RefreshRequest(refreshToken: String)

object RefreshRequest:
  given Reader[RefreshRequest] = macroR
