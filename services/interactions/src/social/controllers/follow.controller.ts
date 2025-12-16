import { Controller, Post, Body, Delete } from '@nestjs/common';
import { FollowService } from '../services/follow.service';
import { CreateFollowDto } from '../model/dto/create-follow.dto';
import { DeleteFollowDto } from '../model/dto/delete-follow.dto';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  async create(@Body() createFollowDto: CreateFollowDto) {
    const follow = await this.followService.follow(createFollowDto);
    return {
      message: 'Follow created successfully',
      statusCode: 201,
    };
  }

  @Delete()
  async remove(@Body() deleteFollowDto: DeleteFollowDto) {
    await this.followService.unfollow(deleteFollowDto);
    return {
      message: 'Follow removed successfully',
      statusCode: 200,
    };
  }
}
