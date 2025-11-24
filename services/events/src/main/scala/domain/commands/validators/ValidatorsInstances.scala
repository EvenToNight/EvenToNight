package domain.commands.validators

import domain.commands.CreateEventDraftCommand
import domain.commands.GetEventCommand
import domain.commands.UpdateEventPosterCommand

object ValidatorsInstances:
  given Validator[CreateEventDraftCommand]  = CreateEventDraftValidator
  given Validator[GetEventCommand]          = GetEventValidator
  given Validator[UpdateEventPosterCommand] = UpdateEventPosterValidator
