import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  NotFoundException,
  Delete,
  // Put,
} from '@nestjs/common';
import { CreateEventTicketTypeHandler } from '../../application/handlers/create-event-ticket-type.handler';
import { CreateEventTicketTypeDto } from '../../application/dto/create-event-ticket-type.dto';
import { EventTicketTypeResponseDto } from '../../application/dto/event-ticket-type-response.dto';
import { DeleteEventTicketTypeHandler } from 'src/tickets/application/handlers/delete-event-ticket-type.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';

@Controller()
export class EventTicketTypesController {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly createHandler: CreateEventTicketTypeHandler,
    private readonly deleteHandler: DeleteEventTicketTypeHandler,
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
    const ticketTypes =
      await this.eventTicketTypeService.findByEventId(eventId);
    return ticketTypes.map((type) =>
      EventTicketTypeResponseDto.fromDomain(type),
    );
  }

  @Get('ticket-types/:ticketTypeId')
  @HttpCode(HttpStatus.OK)
  async getEventTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
  ): Promise<EventTicketTypeResponseDto> {
    const ticketType = await this.eventTicketTypeService.findById(ticketTypeId);
    if (!ticketType) {
      throw new NotFoundException(
        `EventTicketType with id ${ticketTypeId} not found`,
      );
    }
    return EventTicketTypeResponseDto.fromDomain(ticketType);
  }

  @Delete('events/:eventId/ticket-types')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEventTicketTypes(
    @Param('eventId') eventId: string,
  ): Promise<void> {
    return this.deleteHandler.handle(eventId);
  }

  // @Put('ticket-types/:ticketTypeId')
  // @HttpCode(HttpStatus.OK)
  // async updateEventTicketType(
  //   @Param('ticketTypeId') ticketTypeId: string,
  //   @Body(ValidationPipe) dto: CreateEventTicketTypeDto,
  // ): Promise<EventTicketTypeResponseDto> {}
}
