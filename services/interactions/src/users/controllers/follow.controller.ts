import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { FollowService } from '../services/follow.service';
import { FollowUserDto } from '../dto/follow-user.dto';
import { PaginatedQueryDto } from '../../commons/dto/paginated-query.dto';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/auth';

@Controller('users/:userId/')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('following')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('userId') userId: string,
    @Body() followUserDto: FollowUserDto,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'You are not allowed to follow on behalf of another user',
      );
    }
    await this.followService.follow(userId, followUserDto.followedId);
    return {
      message: 'Follow created successfully',
      statusCode: 201,
    };
  }

  @Get('following')
  async getFollowing(
    @Param('userId') userId: string,
    @Query() paginationQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginationQuery;
    return this.followService.getFollowing(userId, limit, offset);
  }

  @Get('following/:followedId')
  async isFollowing(
    @Param('userId') userId: string,
    @Param('followedId') followedId: string,
  ) {
    const isFollowing = await this.followService.isFollowing(
      userId,
      followedId,
    );
    return { isFollowing };
  }

  @Delete('following/:followedId')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('userId') userId: string,
    @Param('followedId') followedId: string,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'You are not allowed to unfollow on behalf of another user',
      );
    }
    await this.followService.unfollow(userId, followedId);
    return {
      message: 'Follow removed successfully',
      statusCode: 200,
    };
  }

  @Get('followers')
  async getFollowers(
    @Param('userId') userId: string,
    @Query() paginationQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginationQuery;
    return this.followService.getFollowers(userId, limit, offset);
  }

  @Get()
  async getUserFollowsInteraction(@Param('userId') userId: string) {
    return this.followService.getUserFollowsInteraction(userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Param('userId') userId: string,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'You are not allowed to delete a user on behalf of another user',
      );
    }
    await this.followService.deleteUser(userId);
    return {
      message: 'All follow relationships removed successfully',
      statusCode: 200,
    };
  }
}
