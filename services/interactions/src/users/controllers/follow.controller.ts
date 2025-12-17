import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { FollowService } from '../services/follow.service';
import { FollowUserDto } from '../common/dto/follow-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('users/:userId/')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('following')
  async create(
    @Param('userId') userId: string,
    @Body() followUserDto: FollowUserDto,
  ) {
    await this.followService.follow(userId, followUserDto.followedId);
    return {
      message: 'Follow created successfully',
      statusCode: 201,
    };
  }

  @Delete('following/:followedId')
  async remove(
    @Param('userId') userId: string,
    @Param('followedId') followedId: string,
  ) {
    await this.followService.unfollow(userId, followedId);
    return {
      message: 'Follow removed successfully',
      statusCode: 200,
    };
  }

  @Get('followers')
  async getFollowers(
    @Param('userId') userId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const { limit, offset } = paginationQuery;
    return this.followService.getFollowers(userId, limit, offset);
  }

  @Get('following')
  async getFollowing(
    @Param('userId') userId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const { limit, offset } = paginationQuery;
    return this.followService.getFollowing(userId, limit, offset);
  }
}
