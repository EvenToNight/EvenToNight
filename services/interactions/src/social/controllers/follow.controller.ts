import { Controller, Post, Body } from '@nestjs/common';
import { FollowService } from '../services/follow.service';
import { CreateFollowDto } from '../model/dto/create-follow.dto';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  async create(@Body() createFollowDto: CreateFollowDto) {
    const follow = await this.followService.createFollow(createFollowDto);
    return {
      message: 'Follow created successfully',
      status: 201,
    };
  }
}
