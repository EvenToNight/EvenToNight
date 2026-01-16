import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from '../../application/services/pdf.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { OrderService } from 'src/tickets/application/services/order.service';

@Controller('orders/:orderId')
export class OrderController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly orderService: OrderService,
    private readonly ticketService: TicketService,
  ) {}

  @Get('')
  async getOrder(@Param('orderId') orderId: string) {
    const order = await this.orderService.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  /**
   * GET /orders/:orderId/pdf
   * Returns a PDF for the specified order containing all tickets.
   */
  @Get('pdf')
  async getOrderPdf(@Param('orderId') orderId: string, @Res() res: Response) {
    const order = await this.orderService.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const ticketIds = order.getTicketIds();
    const tickets = await this.ticketService.findByIds(ticketIds);

    const ticketPdfData = tickets.map((ticket) => ({
      ticketId: ticket.getId(),
      eventId: ticket.getEventId().toString(),
      attendeeName: ticket.getAttendeeName(),
      purchaseDate: ticket.getPurchaseDate(),
      priceLabel: `${ticket.getPrice().getAmount()} ${ticket.getPrice().getCurrency()}`,
    }));

    const buffer = await this.pdfService.generateTicketsPdf(ticketPdfData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="order-${orderId}.pdf"`,
    );
    return res.send(buffer);
  }
}
