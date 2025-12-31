import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Logger,
} from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { TicketPublisher } from './ticket.publisher';
import { UseTicketDto } from '../dto/ticket-response.dto';

@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(
    private ticketService: TicketService,
    private ticketPublisher: TicketPublisher,
  ) {}

  @Get('users/:userId')
  async getUserTickets(
    @Param('userId') userId: string,
    @Query('eventId') eventId?: string,
  ) {
    this.logger.log(`Getting tickets for user ${userId}`);
    return this.ticketService.getUserTickets(userId, eventId);
  }

  @Get(':ticketNumber')
  async getTicket(@Param('ticketNumber') ticketNumber: string) {
    this.logger.log(`Getting ticket ${ticketNumber}`);
    return this.ticketService.getTicketByNumber(ticketNumber);
  }

  @Patch(':ticketNumber/use')
  async useTicket(
    @Param('ticketNumber') ticketNumber: string,
    @Body() dto: UseTicketDto,
  ) {
    this.logger.log(`Using ticket ${ticketNumber}`);
    const ticket = await this.ticketService.useTicket(
      ticketNumber,
      dto.scannedBy,
    );

    // Publish ticket.used event
    await this.ticketPublisher.publishTicketUsed(ticket);

    return ticket;
  }
}
