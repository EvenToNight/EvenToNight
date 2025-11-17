package controller

import cask.MainRoutes
import cask.main.Routes
import middleware.CorsDecorator
import service.EventService

class EventRoutes(eventService: EventService) extends MainRoutes:
  override def port: Int    = sys.env.get("EVENTS_SERVICE_PORT").map(_.toInt).getOrElse(9010)
  override def host: String = sys.env.getOrElse("EVENTS_SERVICE_HOST", "0.0.0.0")

  override def decorators = new CorsDecorator() :: Nil

  override val allRoutes: Seq[Routes] = Seq(
    new EventCommandApi(eventService),
    new EventTagApi()
  )

  initialize()
