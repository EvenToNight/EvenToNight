import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  Param,
  Query,
} from '@nestjs/common';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { PaginatedQueryDto } from 'src/commons/application/dto/paginated-query.dto';
import { Pagination } from 'src/commons/utils/pagination.utils';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { PaginatedResponseDto } from 'src/commons/application/dto/paginated-response.dto';

@Controller('users/:userId')
export class UserController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * GET /users/:userId/tickets
   * Returns all tickets for the specified user.
   */
  @Get('tickets/')
  @HttpCode(HttpStatus.OK)
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
