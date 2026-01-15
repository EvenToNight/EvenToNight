package model

import cask.Request
import ujson.IncompleteParseException
import ujson.ParseException
import upickle.core.AbortException
import upickle.default.read

object LogoutRequestParser:
  def parseLogoutRequest(logoutReq: Request): Either[String, LogoutRequest] =
    try Right(read[LogoutRequest](logoutReq.text()))
    catch
      case _: ParseException | _: IncompleteParseException | _: AbortException => Left("Invalid JSON")
