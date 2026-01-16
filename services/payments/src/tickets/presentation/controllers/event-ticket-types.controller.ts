import {
  Controller,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Delete,
  // Put,
} from '@nestjs/common';
import { CreateEventTicketTypeHandler } from '../../application/handlers/create-event-ticket-type.handler';
import { EventTicketTypeResponseDto } from '../../application/dto/event-ticket-type-response.dto';
import { DeleteTicketTypeHandler } from 'src/tickets/application/handlers/delete-ticket-type.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';

@Controller('ticket-types')
export class EventTicketTypesController {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly createHandler: CreateEventTicketTypeHandler,
    private readonly deleteHandler: DeleteTicketTypeHandler,
  ) {}

  @Get('values')
  @HttpCode(HttpStatus.OK)
  getAllTicketTypeValues(): string[] {
    return this.eventTicketTypeService.getAllTicketTypeValues();
  }

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

  @Delete(':ticketTypeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEventTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
  ): Promise<void> {
    return this.deleteHandler.handle(ticketTypeId);
  }

  //TODO track selling price in tickets
  // @Put('ticket-types/:ticketTypeId')
  // @HttpCode(HttpStatus.OK)
  // async updateEventTicketType(
  //   @Param('ticketTypeId') ticketTypeId: string,
  //   @Body(ValidationPipe) dto: CreateEventTicketTypeDto,
  // ): Promise<EventTicketTypeResponseDto> {}
}
