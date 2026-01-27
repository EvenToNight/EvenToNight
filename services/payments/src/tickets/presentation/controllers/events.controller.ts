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
  NotFoundException,
  Query,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEventTicketTypeHandler } from '../../application/handlers/create-event-ticket-type.handler';
import { CreateEventTicketTypeDto } from '../../application/dto/create-event-ticket-type.dto';
import { EventTicketTypeResponseDto } from '../../application/dto/event-ticket-type-response.dto';
import { DeleteEventTicketTypesHandler } from 'src/tickets/application/handlers/delete-event-ticket-types.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import {
  CurrentUser,
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from 'src/commons/infrastructure/auth';
import { EventService } from 'src/tickets/application/services/event.service';
import { CreateEventDto } from '../../application/dto/create-event.dto';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';
import { GetEventsByPriceQueryDto } from '../../application/dto/get-events-by-price-query.dto';
import { PaginatedResult } from 'src/commons/domain/types/pagination.types';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly eventService: EventService,
    private readonly createHandler: CreateEventTicketTypeHandler,
    private readonly deleteHandler: DeleteEventTicketTypesHandler,
  ) {}

  /**
   * GET /events
   * Returns event IDs paginated by minimum price.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  getEventsIds(
    @Query(ValidationPipe) query: GetEventsByPriceQueryDto,
  ): Promise<PaginatedResult<EventId>> {
    return this.eventTicketTypeService.findEventIds({
      ...query,
    });
  }

  /**
   * POST /events/:eventId
   * Creates a new event.
   * @deprecated Use /internal/events/:eventId instead for internal microservice communication
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

  /**
   * GET /events/:eventId/ticket-types
   * Returns the ticket types for the specified event.
   */
  @Get(':eventId/ticket-types')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  async getEventTicketTypes(
    @Param('eventId') eventId: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<EventTicketTypeResponseDto[]> {
    const event = await this.eventService.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }
    if (
      (!userId && event.getStatus() !== EventStatus.PUBLISHED) ||
      (userId &&
        event.getCreatorId().toString() !== userId &&
        event.getStatus() !== EventStatus.PUBLISHED)
    ) {
      throw new ForbiddenException(
        'Current user cannot access this event ticket types',
      );
    }
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
