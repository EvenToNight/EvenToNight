import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from '../schemas/review.schema';
import { CreateReviewDto } from '../dto/create-review.dto';
import { MetadataService } from 'src/metadata/services/metadata.service';
import { UpdateReviewDto } from '../dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private readonly metadataService: MetadataService,
  ) {}

  async createReview(
    eventId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    await this.metadataService.validateUser(createReviewDto.userId);
    await this.metadataService.validateEvent(
      eventId,
      createReviewDto.organizationId,
      createReviewDto.collaboratorsId,
    );

    const existing = await this.reviewModel.findOne({
      eventId,
      userId: createReviewDto.userId,
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this event');
    }
    const review = new this.reviewModel({
      eventId,
      ...createReviewDto,
    });
    return review.save();
  }

  async deleteReview(eventId: string, userId: string): Promise<void> {
    const result = await this.reviewModel.deleteOne({ eventId, userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Review not found');
    }
  }

  async updateReview(
    eventId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewModel.findOneAndUpdate(
      { eventId, userId },
      { rating: updateReviewDto.rating, comment: updateReviewDto.comment },
      { new: true },
    );

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }
}
