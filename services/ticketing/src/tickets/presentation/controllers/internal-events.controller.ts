import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEventDto } from '../../application/dto/create-event.dto';
import { CreateEventHandler } from '../../application/handlers/create-event.handler';
import { EventAlreadyExistsException } from '../../domain/exceptions/event-already-exists.exception';

@Controller('internal/events')
export class InternalEventsController {
  constructor(private readonly createEventHandler: CreateEventHandler) {}

  /**
   * POST /internal/events/:eventId
   * Creates a new event (internal endpoint).
   */
  @Post(':eventId')
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdateEvent(
    @Param('eventId') eventId: string,
    @Body(ValidationPipe) dto: CreateEventDto,
  ): Promise<void> {
    try {
      await this.createEventHandler.handle(eventId, dto);
    } catch (error) {
      if (error instanceof EventAlreadyExistsException) {
        // event.created consumer may have already created the event — treat as success
        return;
      }
      throw new InternalServerErrorException(
        `Failed to create or update event: ${error}`,
      );
    }
  }
}
