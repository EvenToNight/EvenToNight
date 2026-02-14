package domain

import cask.Request
import domain.RefreshRequest
import ujson.IncompleteParseException
import ujson.ParseException
import upickle.core.AbortException
import upickle.default.read

object TokenRefresh:
  def parseRefreshRequest(req: Request): Either[String, RefreshRequest] =
    try Right(read[RefreshRequest](req.text()))
    catch
      case _: ParseException | _: IncompleteParseException | _: AbortException => Left("Invalid JSON")
