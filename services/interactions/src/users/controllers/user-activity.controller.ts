import { Controller, Get, Param, Query } from '@nestjs/common';
import { LikeService } from '../../events/services/like.service';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';
import { ReviewService } from '../../events/services/review.service';

@Controller('users/:userId')
export class UserActivityController {
  constructor(
    private readonly likeService: LikeService,
    private readonly reviewService: ReviewService,
  ) {}

  @Get('likes')
  async getLikedEvents(
    @Param('userId') userId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.likeService.getUserLikes(userId, limit, offset);
  }

  @Get('reviews')
  async getUserReviews(
    @Param('userId') userId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.reviewService.getUserReviews(userId, limit, offset);
  }
}
