import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParticipationService } from '../services/participation.service';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';

@Controller('events')
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @Get(':eventId/participants')
  async getEventParticipants(
    @Param('eventId') eventId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.participationService.getEventParticipants(
      eventId,
      limit,
      offset,
    );
  }
}
