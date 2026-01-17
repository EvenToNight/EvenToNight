import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { PaginatedQueryDto } from 'src/commons/application/dto/paginated-query.dto';
import { Pagination } from 'src/commons/utils/pagination.utils';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { PaginatedResponseDto } from 'src/commons/application/dto/paginated-response.dto';
import { CurrentUser, JwtAuthGuard } from 'src/commons/infrastructure/auth';

@Controller('users/:userId')
export class UserController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * GET /users/:userId/tickets
   * Returns all tickets for the specified user.
   */
  @Get('tickets/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getUserTickets(
    @Param('userId') userId: string,
    @Query() query: PaginatedQueryDto,
    @CurrentUser('userId') currentUserId: string,
  ): Promise<PaginatedResponseDto<Ticket>> {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'Forbidden: Cannot access tickets of other users',
      );
    }
    return await this.ticketService.findByUserId(
      userId,
      Pagination.parse(query.limit, query.offset),
    );
  }
}
