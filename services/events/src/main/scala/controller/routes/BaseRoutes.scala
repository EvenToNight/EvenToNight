package controller.routes

import cask.Routes
import middleware.CorsDecorator

abstract class BaseRoutes extends Routes:
  override def decorators = new CorsDecorator() :: Nil
