package middleware

import cask.RawDecorator
import cask.model.Response
import cask.router.Result

class CorsDecorator extends RawDecorator:

  private val corsHeaders = Seq(
    "Access-Control-Allow-Origin"  -> "*",
    "Access-Control-Allow-Methods" -> "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers" -> "Content-Type, Authorization"
  )

  def wrapFunction(ctx: cask.Request, delegate: Delegate): cask.router.Result[Response.Raw] =

    val method = ctx.exchange.getRequestMethod.toString

    if method == "OPTIONS" then
      Result.Success(
        Response(
          data = "",
          statusCode = 204,
          headers = corsHeaders
        )
      )
    else
      delegate(ctx, Map()).map { response =>
        Response(
          data = response.data.data,
          statusCode = response.data.statusCode,
          headers = response.data.headers ++ corsHeaders
        )
      }
