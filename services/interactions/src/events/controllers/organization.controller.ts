import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReviewService } from '../../events/services/review.service';
import { PaginatedQueryDto } from '../../commons/dto/paginated-query.dto';

@Controller('organizations/:organizationId')
export class OrganizationController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('reviews')
  async getOrganizationReviews(
    @Param('organizationId') organizationId: string,
    @Query('role') role: 'creator' | 'collaborator' | 'all' = 'all',
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.reviewService.getOrganizationReviews(
      organizationId,
      role,
      limit,
      offset,
    );
  }
}
