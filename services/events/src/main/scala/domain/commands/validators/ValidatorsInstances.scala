package domain.commands.validators

import domain.commands.CreateEventCommand
import domain.commands.DeleteEventCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventCommand
import domain.commands.UpdateEventPosterCommand

object ValidatorsInstances:
  given Validator[CreateEventCommand]       = CreateEventValidator
  given Validator[GetEventCommand]          = GetEventValidator
  given Validator[UpdateEventPosterCommand] = UpdateEventPosterValidator
  given Validator[UpdateEventCommand]       = UpdateEventValidator
  given Validator[DeleteEventCommand]       = DeleteEventValidator
