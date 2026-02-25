import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventService } from 'src/tickets/application/services/event.service';
import { CreateEventDto } from '../../application/dto/create-event.dto';
import { CreateEventHandler } from '../../application/handlers/create-event.handler';

@Controller('internal/events')
export class InternalEventsController {
  constructor(
    private readonly createEventHandler: CreateEventHandler,
    private readonly eventService: EventService,
  ) {}

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
    //TODO: handle possible interleaving of this endpoint and the event.created consumer for the same eventId
    try {
      await this.createEventHandler.handle(eventId, dto);
    } catch (error) {
      if (this.eventService.isDuplicateError(error)) {
        throw new ConflictException(`Event with id ${eventId} already exists`);
      }
      throw new InternalServerErrorException(
        `Failed to create or update event: ${error}`,
      );
    }
  }
}
