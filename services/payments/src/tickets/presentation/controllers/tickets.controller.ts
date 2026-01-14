import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from '../../application/services/pdf.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { PaginatedQueryDto } from 'src/commons/application/dto/paginated-query.dto';
import { Pagination } from 'src/tickets/utils/pagination.utils';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { PaginatedResponseDto } from 'src/commons/application/dto/paginated-response.dto';

@Controller()
export class TicketsController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly ticketService: TicketService,
  ) {}

  /**
   * GET /users/:userId/tickets
   * Returns all tickets for the specified user.
   */
  @Get('users/:userId/tickets/')
  async getUserTickets(
    @Param('userId') userId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponseDto<Ticket>> {
    const tickets = await this.ticketService.findByUserId(
      userId,
      Pagination.parse(query.limit, query.offset),
    );
    return tickets;
  }

  @Get('tickets/:ticketId')
  async getUserTicket(@Param('ticketId') ticketId: string) {
    const ticket = await this.ticketService.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  /**
   * GET /tickets/:ticketId/pdf
   * Returns a PDF for the specified ticket.
   */
  @Get('tickets/:ticketId/pdf')
  async getTicketPdf(
    @Param('ticketId') ticketId: string,
    @Res() res: Response,
  ) {
    const ticket = await this.ticketService.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const buffer = await this.pdfService.generateTicketsPdf([
      {
        ticketId: ticket.getId(),
        eventId: ticket.getEventId().toString(),
        attendeeName: ticket.getAttendeeName(),
        purchaseDate: ticket.getPurchaseDate(),
        priceLabel: `${ticket.getPrice().getAmount()} ${ticket.getPrice().getCurrency()}`,
      },
    ]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="ticket-${ticketId}.pdf"`,
    );
    return res.send(buffer);
  }
}
