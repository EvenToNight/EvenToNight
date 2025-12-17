import { Controller, Get, Param, Query } from '@nestjs/common';
import { LikeService } from '../../events/services/like.service';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';

@Controller('users/:userId')
export class UserActivityController {
  constructor(private readonly likeService: LikeService) {}

  @Get('likes')
  async getLikedEvents(
    @Param('userId') userId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.likeService.getUserLikes(userId, limit, offset);
  }
}
