import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { PaginatedQueryDto } from 'src/commons/application/dto/paginated-query.dto';
import { Pagination } from 'src/commons/utils/pagination.utils';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { PaginatedResponseDto } from 'src/commons/application/dto/paginated-response.dto';
import { CurrentUser, JwtAuthGuard } from 'src/commons/infrastructure/auth';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { PdfService } from 'src/tickets/application/services/pdf.service';

@Controller('users/:userId')
export class UserController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly pdfService: PdfService,
  ) {}

  /**
   * GET /users/:userId/tickets
   * Returns all tickets for the specified user.
   * Optional query parameter: eventId to filter tickets by event.
   */
  @Get('tickets/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getUserTickets(
    @Param('userId') userId: string,
    @Query() query: PaginatedQueryDto,
    @Query('eventId') eventId: string | undefined,
    @CurrentUser('userId') currentUserId: string,
  ): Promise<PaginatedResponseDto<Ticket>> {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'Forbidden: Cannot access tickets of other users',
      );
    }

    if (eventId) {
      const result = await this.ticketService.findByUserIdAndEventId(
        userId,
        eventId,
      );
      return Pagination.createResult(
        result,
        result.length,
        Pagination.parse(query.limit, query.offset),
      );
    }

    return await this.ticketService.findByUserId(
      userId,
      Pagination.parse(query.limit, query.offset),
    );
  }

  /**
   * GET /users/:userId/events
   * Returns all events where the specified user has bought tickets.
   */
  @Get('events/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getUserEvents(
    @Param('userId') userId: string,
    @Query() query: PaginatedQueryDto,
    @CurrentUser('userId') currentUserId: string,
  ): Promise<PaginatedResponseDto<EventId>> {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'Forbidden: Cannot access tickets of other users',
      );
    }
    return await this.ticketService.findEventsByUserId(
      userId,
      Pagination.parse(query.limit, query.offset),
    );
  }

  /**
   * GET /users/:userId/events/:eventId/pdf
   * Returns pdf with all tickets for the specified user and event.
   */
  @Get('events/:eventId/pdf')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getUserEventTicketsPdf(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
    @CurrentUser('userId') currentUserId: string,
    @Res() res: Response,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'Forbidden: Cannot access tickets of other users',
      );
    }

    const result = await this.ticketService.findByUserIdAndEventId(
      userId,
      eventId,
    );

    if (result.length === 0) {
      throw new NotFoundException('No tickets found for this event');
    }

    const ticketPdfData = result.map((ticket) => ({
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
      `inline; filename="tickets-${userId}-${eventId}.pdf"`,
    );
    return res.send(buffer);
  }
}
