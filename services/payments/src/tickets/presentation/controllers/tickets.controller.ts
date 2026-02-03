import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  Put,
} from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from '../../application/services/pdf.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { VerifyTicketHandler } from 'src/tickets/application/handlers/verify-ticket.handler';
import {
  JwtAuthGuard,
  CurrentUser,
  type AuthUser,
} from 'src/commons/infrastructure/auth';
import { EventService } from 'src/tickets/application/services/event.service';
import { UserService } from 'src/tickets/application/services/user.service';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';

@Controller('tickets/:ticketId')
export class TicketsController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly ticketService: TicketService,
    private readonly eventService: EventService,
    private readonly verifyTicketHandler: VerifyTicketHandler,
    private readonly userService: UserService,
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
  ): Promise<Ticket> {
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
   * PUT /tickets/:ticketId/verify
   * Verifies a ticket by marking it as USED.
   * Returns true if ticket was newly verified (first time).
   * Returns false if ticket was already used.
   * Only the event creator can verify tickets.
   */
  @Put('verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async verifyTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<boolean> {
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
      throw new ForbiddenException('Not authorized to verify this ticket');
    }
    return await this.verifyTicketHandler.handle(ticketId);
  }

  /**
   * GET /tickets/:ticketId/pdf
   * Returns a PDF for the specified ticket.
   */
  @Get('pdf')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getTicketPdf(
    @Param('ticketId') ticketId: string,
    @CurrentUser('userId') userId: string,
    @Res() res: Response,
  ) {
    const ticket = await this.ticketService.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    if (ticket.getUserId().toString() !== userId) {
      throw new ForbiddenException('Not authorized to view this ticket');
    }
    const event = await this.eventService.findById(
      ticket.getEventId().toString(),
    );
    if (!event) {
      throw new NotFoundException(
        `Event with id ${ticket.getEventId().toString()} not found`,
      );
    }

    const userLanguage = await this.userService.getUserLanguage(userId);

    const buffer = await this.pdfService.generateTicketsPdf(
      [
        {
          ticketId: ticket.getId(),
          eventId: ticket.getEventId().toString(),
          attendeeName: ticket.getAttendeeName(),
          purchaseDate: ticket.getPurchaseDate(),
          eventDate: event.getDate(),
          priceLabel: `${ticket.getPrice().getAmount()} ${ticket.getPrice().getCurrency()}`,
          eventTitle: event.getTitle() || 'EventoNight',
        },
      ],
      userLanguage,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="ticket-${ticketId}.pdf"`,
    );
    return res.send(buffer);
  }
}
