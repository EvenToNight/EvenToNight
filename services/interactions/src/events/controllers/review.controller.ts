import {
  Controller,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';

@Controller('events/:eventId')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('reviews')
  async createReview(
    @Param('eventId') eventId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    await this.reviewService.createReview(eventId, createReviewDto);
    return {
      message: 'Review created successfully',
      statusCode: 201,
    };
  }

  @Put('reviews/:userId')
  async updateReview(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
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
