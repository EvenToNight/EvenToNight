package model

import upickle.default.Reader
import upickle.default.macroR

case class LogoutRequest(refreshToken: String)

object LogoutRequest:
  given Reader[LogoutRequest] = macroR
