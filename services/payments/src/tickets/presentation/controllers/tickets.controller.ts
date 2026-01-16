import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from '../../application/services/pdf.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';

@Controller('tickets/:ticketId')
export class TicketsController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly ticketService: TicketService,
  ) {}

  @Get('')
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
  @Get('pdf')
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
