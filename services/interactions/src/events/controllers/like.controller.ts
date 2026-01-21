import {
  Body,
  Controller,
  Param,
  Post,
  Delete,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { LikeService } from '../services/like.service';
import { PaginatedQueryDto } from '../../commons/dto/paginated-query.dto';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/auth/current-user.decorator';

@Controller('events/:eventId')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('likes')
  @UseGuards(JwtAuthGuard)
  async likeEvent(
    @Param('eventId') eventId: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.likeService.likeEvent(eventId, userId);
    return {
      message: 'Event liked successfully',
      statusCode: 201,
    };
  }

  @Delete('likes/:userId')
  @UseGuards(JwtAuthGuard)
  async unlikeEvent(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'You are not allowed to unlike on behalf of another user',
      );
    }
    await this.likeService.unlikeEvent(eventId, userId);
    return {
      message: 'Event unliked successfully',
      statusCode: 200,
    };
  }

  @Get('likes')
  async getEventLikes(
    @Param('eventId') eventId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.likeService.getEventLikes(eventId, limit, offset);
  }
}
