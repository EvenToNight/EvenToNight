import {
  Body,
  Controller,
  Param,
  Post,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { LikeService } from '../services/like.service';
import { LikeEventDto } from '../dto/like-event.dto';
import { PaginatedQueryDto } from '../../commons/dto/paginated-query.dto';

@Controller('events/:eventId')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('likes')
  async likeEvent(
    @Param('eventId') eventId: string,
    @Body() likeEventDto: LikeEventDto,
  ) {
    await this.likeService.likeEvent(eventId, likeEventDto.userId);
    return {
      message: 'Event liked successfully',
      statusCode: 201,
    };
  }

  @Delete('likes/:userId')
  async unlikeEvent(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
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
