package domain.commands.validators

import domain.commands.CreateEventDraftCommand

object Validators:
  given Validator[CreateEventDraftCommand] = CreateEventDraftValidator
