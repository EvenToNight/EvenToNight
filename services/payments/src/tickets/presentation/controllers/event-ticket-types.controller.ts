import {
  Controller,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Delete,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { EventTicketTypeResponseDto } from '../../application/dto/event-ticket-type-response.dto';
import { DeleteTicketTypeHandler } from 'src/tickets/application/handlers/delete-ticket-type.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { UpdateEventTicketTypeDto } from 'src/tickets/application/dto/update-event-ticket-type.dto';

@Controller('ticket-types')
export class EventTicketTypesController {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly deleteHandler: DeleteTicketTypeHandler,
  ) {}

  /**
   * GET /ticket-types/values
   * Returns all ticket type values.
   */
  @Get('values')
  @HttpCode(HttpStatus.OK)
  getAllTicketTypeValues(): string[] {
    return this.eventTicketTypeService.getAllTicketTypeValues();
  }

  /**
   * GET /ticket-types/:ticketTypeId
   * Returns the ticket type details for the specified ticket type.
   */
  @Get(':ticketTypeId')
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

  /**
   * PUT /ticket-types/:ticketTypeId
   * Updates the ticket type details for the specified ticket type.
   */
  //TODO track selling price in tickets
  @Put(':ticketTypeId')
  @HttpCode(HttpStatus.OK)
  async updateEventTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
    @Body(ValidationPipe) dto: UpdateEventTicketTypeDto,
  ): Promise<EventTicketTypeResponseDto> {
    const updatedTicketType = await this.eventTicketTypeService.updateTicket(
      ticketTypeId,
      dto,
    );
    return EventTicketTypeResponseDto.fromDomain(updatedTicketType);
  }

  /**
   * DELETE /ticket-types/:ticketTypeId
   * Deletes the ticket type with the specified ticket type ID.
   */
  @Delete(':ticketTypeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEventTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
  ): Promise<void> {
    return this.deleteHandler.handle(ticketTypeId);
  }
}
