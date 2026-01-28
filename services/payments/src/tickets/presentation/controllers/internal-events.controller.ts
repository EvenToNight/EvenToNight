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
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

@Controller('internal/events')
export class InternalEventsController {
  constructor(private readonly eventService: EventService) {}

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
      await this.eventService.save(
        Event.create({
          id: EventId.fromString(eventId),
          creatorId: UserId.fromString(dto.creatorId),
          date: dto.date,
          title: dto.title,
          status: EventStatus.fromString(dto.status),
        }),
      );
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
