import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from '../../application/services/pdf.service';
import { Inject } from '@nestjs/common';
import { ORDER_REPOSITORY } from 'src/tickets/domain/repositories/order.repository.interface';
import type { OrderRepository } from 'src/tickets/domain/repositories/order.repository.interface';
import { TICKET_REPOSITORY } from 'src/tickets/domain/repositories/ticket.repository.interface';
import type { TicketRepository } from 'src/tickets/domain/repositories/ticket.repository.interface';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly pdfService: PdfService,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
  ) {}

  /**
   * GET /orders/:orderId/pdf
   * Returns a PDF for the specified order containing all tickets.
   */
  @Get(':orderId/pdf')
  async getOrderPdf(@Param('orderId') orderId: string, @Res() res: Response) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Recupera tutti i ticket dell'ordine
    const ticketIds = order.getTicketIds();
    const tickets = await Promise.all(
      ticketIds.map((id) => this.ticketRepository.findById(id)),
    );

    // Filtra ticket null (se qualcuno non esiste)
    const validTickets = tickets.filter((t) => t !== null);

    if (validTickets.length === 0) {
      throw new NotFoundException('No tickets found for this order');
    }

    // Prepara i dati per il PDF
    const ticketPdfData = validTickets.map((ticket) => ({
      ticketId: ticket.getId(),
      eventId: ticket.getEventId().toString(),
      attendeeName: ticket.getAttendeeName(),
      purchaseDate: ticket.getPurchaseDate(),
      priceLabel: `${ticket.getPrice().getAmount()} ${ticket.getPrice().getCurrency()}`,
    }));

    // Genera PDF con tutti i ticket
    const buffer = await this.pdfService.generateTicketsPdf(ticketPdfData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="order-${orderId}.pdf"`,
    );
    return res.send(buffer);
  }
}
