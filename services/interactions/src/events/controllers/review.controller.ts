import {
  Controller,
  Post,
  Delete,
  Put,
  Get,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';

@Controller('events/:eventId/')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('reviews')
  async createReview(
    @Param('eventId') eventId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const review = await this.reviewService.createReview(
      eventId,
      createReviewDto,
    );
    return {
      message: 'Review created successfully',
      statusCode: 201,
    };
  }
}
