import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  HttpStatus,
  HttpCode,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from '../../application/services/pdf.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { OrderService } from 'src/tickets/application/services/order.service';
import { JwtAuthGuard } from 'src/commons/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/infrastructure/auth/current-user.decorator';
import { UserService } from 'src/tickets/application/services/user.service';
import { EventService } from 'src/tickets/application/services/event.service';

@Controller('orders/:orderId')
export class OrderController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
    private readonly eventService: EventService,
  ) {}

  /**
   * GET /orders/:orderId
   * Returns the order details for the specified order.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getOrder(
    @Param('orderId') orderId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const order = await this.orderService.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.getUserId().toString() !== userId) {
      throw new ForbiddenException(
        'User is not authorized to access this order',
      );
    }
    return order;
  }

  /**
   * GET /orders/:orderId/pdf
   * Returns a PDF for the specified order containing all tickets.
   */
  //TODO: test endpoint and add auth
  @Get('pdf')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getOrderPdf(
    @Param('orderId') orderId: string,
    @CurrentUser('userId') userId: string,
    @Res() res: Response,
  ) {
    const order = await this.orderService.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.getUserId().toString() !== userId) {
      throw new ForbiddenException(
        'User is not authorized to access this order',
      );
    }
    const userLanguage = await this.userService.getUserLanguage(userId);
    const ticketIds = order.getTicketIds();
    const tickets = await this.ticketService.findByIds(ticketIds);
    const event = await this.eventService.findById(
      tickets[0].getEventId().toString(),
    );
    if (!event) {
      throw new NotFoundException(
        `Event with id ${tickets[0].getEventId().toString()} not found`,
      );
    }

    const ticketPdfData = tickets.map((ticket) => ({
      ticketId: ticket.getId(),
      eventId: ticket.getEventId().toString(),
      attendeeName: ticket.getAttendeeName(),
      purchaseDate: ticket.getPurchaseDate(),
      priceLabel: `${ticket.getPrice().getAmount()} ${ticket.getPrice().getCurrency()}`,
      eventTitle: event.getTitle() || 'EventoNight',
    }));

    const buffer = await this.pdfService.generateTicketsPdf(
      ticketPdfData,
      userLanguage,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="order-${orderId}.pdf"`,
    );
    return res.send(buffer);
  }
}
