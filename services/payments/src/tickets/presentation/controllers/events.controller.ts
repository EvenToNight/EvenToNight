import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CreateEventTicketTypeHandler } from '../../application/handlers/create-event-ticket-type.handler';
import { CreateEventTicketTypeDto } from '../../application/dto/create-event-ticket-type.dto';
import { EventTicketTypeResponseDto } from '../../application/dto/event-ticket-type-response.dto';
import { DeleteEventTicketTypesHandler } from 'src/tickets/application/handlers/delete-event-ticket-types.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { CurrentUser, JwtAuthGuard } from 'src/commons/infrastructure/auth';
import { EventService } from 'src/tickets/application/services/event.service';
import { CreateEventDto } from '../../application/dto/create-event.dto';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

@Controller('events')
export class EventController {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly eventService: EventService,
    private readonly createHandler: CreateEventTicketTypeHandler,
    private readonly deleteHandler: DeleteEventTicketTypesHandler,
  ) {}

  /**
   * POST /events
   * Creates a new event.
   */
  @Post(':eventId')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  async createOrUpdateEvent(
    @Param('eventId') eventId: string,
    @Body(ValidationPipe) dto: CreateEventDto,
    // @CurrentUser('userId') userId: string,
  ): Promise<void> {
    // if (dto.creatorId !== userId) {
    //   throw new ForbiddenException(
    //     'User ID in token does not match creator ID in request body',
    //   );
    // }
    await this.eventService.save(
      Event.create({
        id: EventId.fromString(eventId),
        creatorId: UserId.fromString(dto.creatorId),
        date: dto.date,
        status: EventStatus.fromString(dto.status),
      }),
    );
  }

  /**
   * GET /events/:eventId/ticket-types
   * Returns the ticket types for the specified event.
   */
  @Get(':eventId/ticket-types')
  @HttpCode(HttpStatus.OK)
  async getEventTicketTypes(
    @Param('eventId') eventId: string,
  ): Promise<EventTicketTypeResponseDto[]> {
    const ticketTypes =
      await this.eventTicketTypeService.findByEventId(eventId);
    return ticketTypes.map((type) =>
      EventTicketTypeResponseDto.fromDomain(type),
    );
  }

  /**
   * POST /events/:eventId/ticket-types
   * Creates a new ticket type for the specified event.
   */
  @Post(':eventId/ticket-types')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createEventTicketType(
    @Param('eventId') eventId: string,
    @Body(ValidationPipe) dto: CreateEventTicketTypeDto,
    @CurrentUser('userId') userId: string,
  ): Promise<EventTicketTypeResponseDto> {
    const event = await this.eventService.findById(eventId);
    if (event?.getCreatorId().toString() !== userId) {
      throw new ForbiddenException(
        'User ID in token does not match event creator ID',
      );
    }
    const ticketType = await this.createHandler.handle(eventId, dto);
    return EventTicketTypeResponseDto.fromDomain(ticketType);
  }

  /**
   * DELETE /events/:eventId/ticket-types
   * Deletes all ticket types for the specified event.
   */
  @Delete(':eventId/ticket-types')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteEventTicketTypes(
    @Param('eventId') eventId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    const event = await this.eventService.findById(eventId);
    if (event?.getCreatorId().toString() !== userId) {
      throw new ForbiddenException(
        'User ID in token does not match event creator ID',
      );
    }
    return this.deleteHandler.handle(eventId);
  }
}
