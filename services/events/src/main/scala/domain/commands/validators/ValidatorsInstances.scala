package domain.commands.validators

import domain.commands.CreateEventCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand

object ValidatorsInstances:
  given Validator[CreateEventCommand]       = CreateEventValidator
  given Validator[GetEventCommand]          = GetEventValidator
  given Validator[UpdateEventPosterCommand] = UpdateEventPosterValidator
