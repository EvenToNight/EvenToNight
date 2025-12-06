package controller

import infrastructure.RabbitConnection._
import service.UserService

class UserRoutes(userService: UserService) extends cask.Routes {
  @cask.get("/")
  def hello(request: cask.Request) = {
    print(request.headers)
    val message = "Hello from Scala 3!"
    channel.basicPublish("", queueName, null, message.getBytes())
    println(s"Sent message to RabbitMQ: '$message'")
    "Hello World!"
  }

  initialize()
}
