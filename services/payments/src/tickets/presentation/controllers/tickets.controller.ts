import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Patch,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from '../../application/services/pdf.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { InvalidateTicketStatusDto } from 'src/tickets/application/dto/ticket-status.dto';
import { InvalidateTicketStatusHandler } from 'src/tickets/application/handlers/invalidate-ticket-status.handler';
import {
  JwtAuthGuard,
  CurrentUser,
  type AuthUser,
} from 'src/commons/infrastructure/auth';
import { EventService } from 'src/tickets/application/services/event.service';

@Controller('tickets/:ticketId')
export class TicketsController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly ticketService: TicketService,
    private readonly eventService: EventService,
    private readonly invalidateTicketStatusHandler: InvalidateTicketStatusHandler,
  ) {}

  /**
   * GET /tickets/:ticketId
   * Returns the ticket details for the specified ticket.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getUserTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const ticket = await this.ticketService.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    if (ticket.getUserId().toString() !== user.userId) {
      throw new ForbiddenException('Not authorized to view this ticket');
    }
    return ticket;
  }

  /**
   * PATCH /tickets/:ticketId
   * Updates the status of the specified ticket as invalid.
   */
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateTicketStatus(
    @Param('ticketId') ticketId: string,
    @Body(ValidationPipe) _dto: InvalidateTicketStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    const ticket = await this.ticketService.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    const event = await this.eventService.findById(
      ticket.getEventId().toString(),
    );
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.getCreatorId().toString() !== userId) {
      throw new ForbiddenException('Not authorized to view this ticket');
    }
    return await this.invalidateTicketStatusHandler.handle(ticketId);
  }

  /**
   * GET /tickets/:ticketId/pdf
   * Returns a PDF for the specified ticket.
   */
  //TODO: test this endpoint
  @Get('pdf')
  @HttpCode(HttpStatus.OK)
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
