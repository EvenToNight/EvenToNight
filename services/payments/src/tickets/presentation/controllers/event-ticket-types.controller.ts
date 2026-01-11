import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventTicketTypeHandler } from '../../application/handlers/create-event-ticket-type.handler';
import { CreateEventTicketTypeDto } from '../../application/dto/create-event-ticket-type.dto';
import { EventTicketTypeResponseDto } from '../../application/dto/event-ticket-type-response.dto';
import type { EventTicketTypeRepository } from '../../domain/repositories/event-ticket-type.repository.interface';
import { EVENT_TICKET_TYPE_REPOSITORY } from '../../domain/repositories/event-ticket-type.repository.interface';

@Controller()
export class EventTicketTypesController {
  constructor(
    private readonly createHandler: CreateEventTicketTypeHandler,
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly repository: EventTicketTypeRepository,
  ) {}

  @Post('events/:eventId/ticket-types')
  @HttpCode(HttpStatus.CREATED)
  async createEventTicketType(
    @Param('eventId') eventId: string,
    @Body(ValidationPipe) dto: CreateEventTicketTypeDto,
  ): Promise<EventTicketTypeResponseDto> {
    const ticketType = await this.createHandler.handle(eventId, dto);
    return EventTicketTypeResponseDto.fromDomain(ticketType);
  }

  @Get('events/:eventId/ticket-types')
  @HttpCode(HttpStatus.OK)
  async getEventTicketTypes(
    @Param('eventId') eventId: string,
  ): Promise<EventTicketTypeResponseDto[]> {
    const ticketTypes = await this.repository.findByEventId(eventId);
    return ticketTypes.map((type) =>
      EventTicketTypeResponseDto.fromDomain(type),
    );
  }

  @Get('ticket-types/:ticketTypeId')
  @HttpCode(HttpStatus.OK)
  async getEventTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
  ): Promise<EventTicketTypeResponseDto> {
    const ticketType = await this.repository.findById(ticketTypeId);
    if (!ticketType) {
      throw new NotFoundException(
        `EventTicketType with id ${ticketTypeId} not found`,
      );
    }
    return EventTicketTypeResponseDto.fromDomain(ticketType);
  }
}
