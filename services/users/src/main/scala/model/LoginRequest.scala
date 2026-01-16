package model

import upickle.default.Reader
import upickle.default.macroR

case class LoginRequest(username: Option[String] = None, password: Option[String] = None)

object LoginRequest:
  given Reader[LoginRequest] = macroR
