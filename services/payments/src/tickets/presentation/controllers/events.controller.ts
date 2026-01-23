import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Delete,
  // UseGuards,
  // ForbiddenException,
} from '@nestjs/common';
import { CreateEventTicketTypeHandler } from '../../application/handlers/create-event-ticket-type.handler';
import { CreateEventTicketTypeDto } from '../../application/dto/create-event-ticket-type.dto';
import { EventTicketTypeResponseDto } from '../../application/dto/event-ticket-type-response.dto';
import { DeleteEventTicketTypesHandler } from 'src/tickets/application/handlers/delete-event-ticket-types.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
// import { CurrentUser, JwtAuthGuard } from 'src/commons/infrastructure/auth';
import { EventService } from 'src/tickets/application/services/event.service';
import { EventDto } from '../../application/dto/event.dto';

@Controller('events/:eventId')
export class EventController {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly eventService: EventService,
    private readonly createHandler: CreateEventTicketTypeHandler,
    private readonly deleteHandler: DeleteEventTicketTypesHandler,
  ) {}

  /**
   * PUT /events/:eventId
   * Creates or updates an event (idempotent).
   */
  @Put('')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  //TODO Add Auth
  async createOrUpdateEvent(
    @Param('eventId') eventId: string,
    @Body(ValidationPipe) dto: EventDto,
    // @CurrentUser('userId') userId: string,
  ): Promise<void> {
    // if (dto.creatorId !== userId) {
    //   throw new ForbiddenException(
    //     'User ID in token does not match creator ID in request body',
    //   );
    // }
    console.log('DTO received in controller:', dto);
    await this.eventService.createOrUpdate(
      eventId,
      dto.creatorId,
      dto.date,
      dto.status,
    );
  }

  /**
   * GET /events/:eventId/ticket-types
   * Returns the ticket types for the specified event.
   */
  @Get('ticket-types')
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
  @Post('ticket-types')
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JwtAuthGuard)
  //TODO Add Auth
  async createEventTicketType(
    @Param('eventId') eventId: string,
    @Body(ValidationPipe) dto: CreateEventTicketTypeDto,
    // @CurrentUser('userId') userId: string,
  ): Promise<EventTicketTypeResponseDto> {
    // if (dto.creatorId !== userId) {
    //   throw new ForbiddenException(
    //     'User ID in token does not match creator ID in request body',
    //   );
    // }
    const ticketType = await this.createHandler.handle(eventId, dto);
    return EventTicketTypeResponseDto.fromDomain(ticketType);
  }

  /**
   * DELETE /events/:eventId/ticket-types
   * Deletes all ticket types for the specified event.
   */
  //TODO Add Auth
  @Delete('ticket-types')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtAuthGuard)
  async deleteEventTicketTypes(
    @Param('eventId') eventId: string,
    // @CurrentUser('userId') userId: string,
  ): Promise<void> {
    // const event = await this.eventService.findById(eventId);
    // if (event?.getCreatorId().toString() !== userId) {
    //   throw new ForbiddenException(
    //     'User ID in token does not match event creator ID',
    //   );
    // }
    return this.deleteHandler.handle(eventId);
  }
}
