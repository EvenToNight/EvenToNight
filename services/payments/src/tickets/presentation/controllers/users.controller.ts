import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { GetUserTicketsQueryDto } from 'src/tickets/application/dto/get-user-tickets-query.dto';
import { UserEventsQueryDto } from 'src/tickets/application/dto/user-events-query.dto';
import { Pagination } from '@libs/ts-common';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { PaginatedResponseDto } from '@libs/nestjs-common';
import { JwtAuthGuard, SameUserGuard } from '@libs/nestjs-common';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { GetUserEventTicketsPdfHandler } from 'src/tickets/application/handlers/get-user-event-tickets-pdf.handler';

@Controller('users/:userId')
@UseGuards(JwtAuthGuard, SameUserGuard())
export class UsersController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly getUserEventTicketsPdfHandler: GetUserEventTicketsPdfHandler,
  ) {}

  /**
   * GET /users/:userId/tickets
   * Returns all tickets for the specified user.
   * Optional query parameter: eventId to filter tickets by event.
   */
  @Get('tickets/')
  @HttpCode(HttpStatus.OK)
  async getUserTickets(
    @Param('userId') userId: string,
    @Query() query: GetUserTicketsQueryDto,
  ): Promise<PaginatedResponseDto<Ticket>> {
    if (query.eventId) {
      const result = await this.ticketService.findByUserIdAndEventId(
        userId,
        query.eventId,
      );
      const pagination = Pagination.parse(query.limit, query.offset);
      return Pagination.createResult(
        result.slice(pagination.offset, pagination.offset + pagination.limit),
        result.length,
        pagination,
      );
    }

    return this.ticketService.findByUserId(
      userId,
      Pagination.parse(query.limit, query.offset),
    );
  }

  /**
   * GET /users/:userId/events
   * Returns all events where the specified user has bought tickets.
   * Optional query parameters: status (filter by event status), order (asc/desc for date ordering)
   */
  @Get('events/')
  @HttpCode(HttpStatus.OK)
  async getUserEvents(
    @Param('userId') userId: string,
    @Query() query: UserEventsQueryDto,
  ): Promise<PaginatedResponseDto<string>> {
    const response = await this.ticketService.findEventsByUserId(
      userId,
      Pagination.parse(query.limit, query.offset),
      query.status,
      query.order,
    );
    return {
      items: response.items.map((eventId: EventId) => eventId.toString()),
      totalItems: response.totalItems,
      hasMore: response.hasMore,
      limit: response.limit,
      offset: response.offset,
    };
  }

  /**
   * GET /users/:userId/events/:eventId/pdf
   * Returns pdf with all tickets for the specified user and event.
   */
  @Get('events/:eventId/pdf')
  @HttpCode(HttpStatus.OK)
  async getUserEventTicketsPdf(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.getUserEventTicketsPdfHandler.handle(userId, eventId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    return res.send(buffer);
  }
}
