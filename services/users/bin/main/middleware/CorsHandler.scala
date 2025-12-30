package middleware

import io.undertow.server.HttpHandler
import io.undertow.server.HttpServerExchange
import io.undertow.util.HttpString

class CorsHandler(next: HttpHandler) extends HttpHandler:

  private val corsHeaders = Map(
    "Access-Control-Allow-Origin"  -> "*",
    "Access-Control-Allow-Methods" -> "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers" -> "Content-Type, Authorization, Accept"
  )

  override def handleRequest(exchange: HttpServerExchange): Unit =
    val responseHeaders = exchange.getResponseHeaders
    corsHeaders.foreach { case (key, value) =>
      responseHeaders.put(HttpString.tryFromString(key), value)
    }

    if exchange.getRequestMethod.toString == "OPTIONS" then
      exchange.setStatusCode(204)
      exchange.endExchange()
    else
      next.handleRequest(exchange)
