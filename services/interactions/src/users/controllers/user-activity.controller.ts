import { Controller, Get, Param, Query } from '@nestjs/common';
import { LikeService } from '../../events/services/like.service';
import { PaginatedQueryDto } from '../../commons/dto/paginated-query.dto';
import { ReviewService } from '../../events/services/review.service';
import { ParticipationService } from '../../events/services/participation.service';
import { UserParticipationsQueryDto } from '../dto/user-participations-query.dto';
import { PaginatedSearchQueryDto } from 'src/commons/dto/paginated-search-query.dto';

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
    @Query() paginatedSearchQuery: PaginatedSearchQueryDto,
  ) {
    const { limit, offset, search } = paginatedSearchQuery;
    return this.reviewService.getUserReviews(userId, limit, offset, search);
  }

  @Get('reviews/:eventId')
  async hasUserReviewedEvent(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.reviewService.getReview(userId, eventId);
  }

  @Get('participations')
  async getUserParticipations(
    @Param('userId') userId: string,
    @Query() paginatedQuery: UserParticipationsQueryDto,
  ) {
    const { limit, offset, organizationId, reviewed } = paginatedQuery;
    return this.participationService.getUserParticipations(
      userId,
      limit,
      offset,
      organizationId,
      reviewed,
    );
  }

  @Get('participations/:eventId')
  async hasUserParticipated(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
  ) {
    const hasParticipated = await this.participationService.hasUserParticipated(
      userId,
      eventId,
    );
    const hasReviewed = await this.reviewService.hasUserReviewedEvent(
      userId,
      eventId,
    );
    return { hasParticipated, hasReviewed };
  }
}
