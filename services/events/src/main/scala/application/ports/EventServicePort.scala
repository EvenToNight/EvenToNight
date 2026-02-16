package application.ports

import domain.commands.Commands
import infrastructure.dto.Event

trait EventServicePort:

  def handleCommand(cmd: Commands): Either[String, Any]

  def getEventInfo(eventId: String): Either[String, Event]
