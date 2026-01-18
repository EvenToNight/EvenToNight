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
  // UseGuards,
  // ForbiddenException,
} from '@nestjs/common';
import { EventTicketTypeResponseDto } from '../../application/dto/event-ticket-type-response.dto';
import { DeleteTicketTypeHandler } from 'src/tickets/application/handlers/delete-ticket-type.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { UpdateEventTicketTypeDto } from 'src/tickets/application/dto/update-event-ticket-type.dto';
import { UpdateTicketTypeHandler } from 'src/tickets/application/handlers/update-ticket-type.handler';
// import { JwtAuthGuard } from 'src/commons/infrastructure/auth/jwt-auth.guard';
// import { CurrentUser } from 'src/commons/infrastructure/auth';
import { EventService } from 'src/tickets/application/services/event.service';

@Controller('ticket-types')
export class EventTicketTypesController {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly eventService: EventService,
    private readonly updateHandler: UpdateTicketTypeHandler,
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
  @Put(':ticketTypeId')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  //TODO Add Auth
  async updateEventTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
    @Body(ValidationPipe) dto: UpdateEventTicketTypeDto,
    // @CurrentUser('userId') userId: string,
  ): Promise<EventTicketTypeResponseDto> {
    const ticketType = await this.eventTicketTypeService.findById(ticketTypeId);
    if (!ticketType) {
      throw new NotFoundException(
        `EventTicketType with id ${ticketTypeId} not found`,
      );
    }
    const event = await this.eventService.findById(
      ticketType.getEventId().toString(),
    );
    if (!event) {
      throw new NotFoundException(
        `Event with id ${ticketType.getEventId().toString()} not found`,
      );
    }

    // if (event.getCreatorId().toString() !== userId) {
    //   throw new ForbiddenException(
    //     'User ID in token does not match event creator ID',
    //   );
    // }

    const updatedTicketType = await this.updateHandler.handle(
      ticketTypeId,
      dto,
    );
    return EventTicketTypeResponseDto.fromDomain(updatedTicketType);
  }

  /**
   * DELETE /ticket-types/:ticketTypeId
   * Deletes the ticket type with the specified ticket type ID.
   */
  //TODO Add Auth
  // @UseGuards(JwtAuthGuard)
  @Delete(':ticketTypeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEventTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
    // @CurrentUser('userId') userId: string,
  ): Promise<void> {
    const ticketType = await this.eventTicketTypeService.findById(ticketTypeId);
    if (!ticketType) {
      throw new NotFoundException(
        `EventTicketType with id ${ticketTypeId} not found`,
      );
    }
    const event = await this.eventService.findById(
      ticketType.getEventId().toString(),
    );
    if (!event) {
      throw new NotFoundException(
        `Event with id ${ticketType.getEventId().toString()} not found`,
      );
    }

    // if (event.getCreatorId().toString() !== userId) {
    //   throw new ForbiddenException(
    //     'User ID in token does not match event creator ID',
    //   );
    // }
    return this.deleteHandler.handle(ticketTypeId);
  }
}
