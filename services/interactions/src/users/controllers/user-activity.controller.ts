import { Controller, Get, Param, Query } from '@nestjs/common';
import { LikeService } from '../../events/services/like.service';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';
import { ReviewService } from '../../events/services/review.service';
import { ParticipationService } from '../../events/services/participation.service';

@Controller('users/:userId')
export class UserActivityController {
  constructor(
    private readonly likeService: LikeService,
    private readonly reviewService: ReviewService,
    private readonly participationService: ParticipationService,
  ) {}

  @Get('likes')
  async getLikedEvents(
    @Param('userId') userId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.likeService.getUserLikes(userId, limit, offset);
  }

  @Get('likes/:eventId')
  async hasUserLikedEvent(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
  ) {
    const hasLiked = await this.likeService.hasUserLikedEvent(userId, eventId);
    return { hasLiked };
  }

  @Get('reviews')
  async getUserReviews(
    @Param('userId') userId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.reviewService.getUserReviews(userId, limit, offset);
  }

  @Get('participations')
  async getUserParticipations(
    @Param('userId') userId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.participationService.getUserParticipations(
      userId,
      limit,
      offset,
    );
  }
}
