import { Controller, Get, Param, Query } from '@nestjs/common';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { PaginatedQueryDto } from 'src/commons/application/dto/paginated-query.dto';
import { Pagination } from 'src/tickets/utils/pagination.utils';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { PaginatedResponseDto } from 'src/commons/application/dto/paginated-response.dto';

@Controller('users/:userId')
export class TicketsController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * GET /users/:userId/tickets
   * Returns all tickets for the specified user.
   */
  @Get('tickets/')
  async getUserTickets(
    @Param('userId') userId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponseDto<Ticket>> {
    return await this.ticketService.findByUserId(
      userId,
      Pagination.parse(query.limit, query.offset),
    );
  }
}
