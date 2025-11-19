package controller.routes

import cask.Routes
import cask.router.Decorator
import middleware.CorsDecorator

abstract class BaseRoutes extends Routes:
  override def decorators: Seq[Decorator[?, ?, ?, ?]] = new CorsDecorator() :: Nil
