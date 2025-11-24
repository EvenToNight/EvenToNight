package domain.commands.validators

import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand

object ValidatorsInstances:
  given Validator[CreateEventDraftCommand] = CreateEventDraftValidator
  given Validator[GetEventCommand]         = GetEventValidator
