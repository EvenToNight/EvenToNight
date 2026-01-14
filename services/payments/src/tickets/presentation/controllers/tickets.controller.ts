import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from '../../application/services/pdf.service';
import { Inject } from '@nestjs/common';
import { TICKET_REPOSITORY } from '../../domain/repositories/ticket.repository.interface';
import type { TicketRepository } from '../../domain/repositories/ticket.repository.interface';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly pdfService: PdfService,
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
  ) {}

  /**
   * GET /tickets/:ticketId/pdf
   * Returns a PDF for the specified ticket.
   */
  @Get(':ticketId/pdf')
  async getTicketPdf(
    @Param('ticketId') ticketId: string,
    @Res() res: Response,
  ) {
    const ticket = await this.ticketRepository.findById(ticketId);
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
