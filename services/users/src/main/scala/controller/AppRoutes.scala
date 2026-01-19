package controller

import cask.Response
import ujson.Obj

class AppRoutes extends cask.Routes {

  @cask.get("/health")
  def health(): Response[ujson.Value] =
    Response(
      Obj("status" -> "OK"),
      statusCode = 200
    )

  initialize()
}
