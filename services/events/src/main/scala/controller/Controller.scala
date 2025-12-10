package controller

import cask.MainRoutes
import cask.main.Routes
import io.undertow.server.HttpHandler
import middleware.CorsHandler
import service.EventService

import routes.*

class Controller(eventService: EventService) extends MainRoutes:
  override def port: Int    = sys.env.get("EVENTS_SERVICE_PORT").map(_.toInt).getOrElse(9010)
  override def host: String = "0.0.0.0"

  override def defaultHandler: HttpHandler = new CorsHandler(super.defaultHandler)

  override val allRoutes: Seq[Routes] = Seq(
    new DomainEventRoutes(eventService),
    new EventQueryRoutes(eventService),
    new EventTagRoutes()
  )

  initialize()
