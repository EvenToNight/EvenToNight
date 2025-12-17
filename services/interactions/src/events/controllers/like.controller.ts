import { Body, Controller, Param, Post } from '@nestjs/common';
import { LikeService } from '../services/like.service';
import { LikeEventDto } from '../dto/like-event.dto';

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
}
