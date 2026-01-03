package model

import cask.Request
import ujson.IncompleteParseException
import ujson.ParseException
import upickle.core.AbortException
import upickle.default.read

object LoginValidation:
  def parseLoginRequest(loginReq: Request): Either[String, LoginRequest] =
    try Right(read[LoginRequest](loginReq.text()))
    catch
      case _: ParseException | _: IncompleteParseException | _: AbortException => Left("Invalid JSON")

  def validateLoginRequest(loginReq: LoginRequest): Either[String, ValidLogin] =
    if loginReq.username.isEmpty then
      Left("Username is missing")
    else if loginReq.password.isEmpty then
      Left("Password is missing")
    else
      Right(ValidLogin(loginReq.username.get, loginReq.password.get))
