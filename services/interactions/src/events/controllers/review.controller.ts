import {
  Controller,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { PaginatedQueryDto } from '../../commons/dto/paginated-query.dto';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/auth';

@Controller('events/:eventId')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Param('eventId') eventId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser('userId') userId: string,
  ) {
    if (createReviewDto.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to create a review on behalf of another user',
      );
    }
    await this.reviewService.createReview(eventId, createReviewDto);
    return {
      message: 'Review created successfully',
      statusCode: 201,
    };
  }

  @Put('reviews/:userId')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'You are not allowed to update a review on behalf of another user',
      );
    }
    await this.reviewService.updateReview(eventId, userId, updateReviewDto);
    return {
      message: 'Review updated successfully',
      statusCode: 200,
    };
  }

  @Delete('reviews/:userId')
  async deleteReview(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
    await this.reviewService.deleteReview(eventId, userId);
    return {
      message: 'Review deleted successfully',
      statusCode: 200,
    };
  }

  @Get('reviews')
  async getEventReviews(
    @Param('eventId') eventId: string,
    @Query() paginatedQuery: PaginatedQueryDto,
  ) {
    const { limit, offset } = paginatedQuery;
    return this.reviewService.getEventReviews(eventId, limit, offset);
  }
}
