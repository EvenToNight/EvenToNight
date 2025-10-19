object Main extends cask.MainRoutes {
  override def port: Int    = 9010 // events service port
  override def host: String = "0.0.0.0"

  @cask.get("/health")
  def health(request: cask.Request) = {
    "OK"
  }

  @cask.get("/events")
  def eventsPage(request: cask.Request) = {
    "Welcome to the Events Service"
  }

  initialize()
}
