package domain.commands.validators

import domain.commands.{
  CreateEventCommand,
  DeleteEventCommand,
  GetEventCommand,
  GetFilteredEventsCommand,
  UpdateEventCommand,
  UpdateEventPosterCommand
}

object ValidatorsInstances:
  given Validator[CreateEventCommand]       = CreateEventValidator
  given Validator[GetEventCommand]          = GetEventValidator
  given Validator[UpdateEventPosterCommand] = UpdateEventPosterValidator
  given Validator[UpdateEventCommand]       = UpdateEventValidator
  given Validator[DeleteEventCommand]       = DeleteEventValidator
  given Validator[GetFilteredEventsCommand] = GetFilteredEventsValidator
