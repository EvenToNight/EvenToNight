import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from '../schemas/review.schema';
import { CreateReviewDto } from '../dto/create-review.dto';
import { MetadataService } from 'src/metadata/services/metadata.service';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ReviewStatsDto } from '../dto/review-stats.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService,
  ) {}

  async createReview(
    eventId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    await this.metadataService.validateReviewAllowed(eventId, createReviewDto);
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
      creatorId: 'org1', // MOCK -> get creator from metadata
      collaboratorIds: ['collab1'], // MOCK -> get collaboratorIds from metadata
    });
    return review.save();
  }

  async deleteReview(eventId: string, userId: string): Promise<void> {
    await this.metadataService.validateReviewDeletionAllowed(eventId, userId);
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
    await this.metadataService.validateReviewUpdateAllowed(eventId, userId);
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

  async getEventReviews(
    eventId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponseDto<Review> & ReviewStatsDto> {
    await this.metadataService.validateEventExistence(eventId);
    return this.getReviewsWithStats({ eventId }, limit, offset);
  }

  async getUserReviews(userId: string, limit?: number, offset?: number) {
    await this.metadataService.validateUserExistence(userId);
    return this.getReviewsWithStats({ userId }, limit, offset);
  }

  async getOrganizationReviews(
    organizationId: string,
    role: 'creator' | 'collaborator' | 'all' = 'all',
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponseDto<Review>> {
    await this.metadataService.validateUserExistence(organizationId);
    return this.getReviewsWithStats(
      role === 'creator'
        ? { creatorId: organizationId }
        : role === 'collaborator'
          ? { collaboratorIds: organizationId }
          : {
              $or: [
                { creatorId: organizationId },
                { collaboratorIds: organizationId },
              ],
            },
      limit,
      offset,
    );
  }

  private async getReviewsWithStats(
    filter: Record<string, any>,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponseDto<Review> & ReviewStatsDto> {
    const query = this.reviewModel.find(filter);

    if (offset !== undefined) {
      query.skip(offset);
    }

    if (limit !== undefined) {
      query.limit(limit);
    }

    query.sort({ createdAt: -1 });

    const [items, total, stats] = await Promise.all([
      query.exec(),
      this.reviewModel.countDocuments(filter),
      this.calculateRatingStats(filter),
    ]);

    return {
      ...new PaginatedResponseDto(items, total, limit || total, offset || 0),
      ...stats,
    };
  }

  private async calculateRatingStats(
    filter: Record<string, any>,
  ): Promise<ReviewStatsDto> {
    const result = await this.reviewModel.aggregate([
      { $match: filter },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
              },
            },
          ],
          distribution: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (result[0]?.distribution) {
      result[0].distribution.forEach((item: { _id: number; count: number }) => {
        ratingDistribution[item._id] = item.count;
      });
    }

    const averageRating = result[0]?.stats[0]?.averageRating || 0;

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
    };
  }

  async hasUserReviewedEvent(
    userId: string,
    eventId: string,
  ): Promise<boolean> {
    await this.metadataService.validateUserExistence(userId);
    await this.metadataService.validateEventExistence(eventId);
    const review = await this.reviewModel.findOne({ userId, eventId });
    return !!review;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.metadataService.validateEventExistence(eventId);
    await this.reviewModel.deleteMany({ eventId });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.metadataService.validateUserExistence(userId);
    await this.reviewModel.deleteMany({ userId });
  }
}
