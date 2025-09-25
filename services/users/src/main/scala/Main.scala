object Main extends cask.MainRoutes{
  @cask.get("/")
  def hello(request: cask.Request) = {
    print(request.headers)
    "Hello World!"
    "ahgsha"
  }

  initialize()
}