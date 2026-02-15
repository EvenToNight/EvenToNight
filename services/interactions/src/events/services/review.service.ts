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
import { PaginatedResponseDto } from 'src/commons/dto/paginated-response.dto';
import { ReviewStatsDto } from '../dto/review-stats.dto';
import { RabbitMqPublisherService } from 'src/rabbitmq/rabbitmq-publisher.service';
import { TransactionManagerService } from 'src/commons/database/transaction-manager.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService,
    private readonly rabbitMqPublisher: RabbitMqPublisherService,
    private readonly transactionManager: TransactionManagerService,
  ) {}

  async createReview(
    eventId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.transactionManager.executeInTransaction(async (session) => {
      await this.metadataService.validateReviewAllowed(
        eventId,
        createReviewDto,
        session,
      );
      const existing = await this.reviewModel
        .findOne({
          eventId,
          userId: createReviewDto.userId,
        })
        .session(session);
      if (existing) {
        throw new ConflictException('You have already reviewed this event');
      }
      const { creatorId, collaboratorIds } =
        await this.metadataService.getEventInfo(eventId, session);
      const review = new this.reviewModel({
        eventId,
        ...createReviewDto,
        creatorId,
        collaboratorIds,
      });

      await review.save({ session });

      const userInfo = await this.metadataService.getUserInfo(
        createReviewDto.userId,
      );

      await this.rabbitMqPublisher.publishReviewCreated({
        creatorId: review.creatorId,
        eventId: review.eventId,
        userId: review.userId,
        userName: userInfo.name,
        userAvatar: userInfo.avatar,
      });

      return review;
    });
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
    rating?: number,
  ): Promise<PaginatedResponseDto<Review> & ReviewStatsDto> {
    await this.metadataService.validateEventExistence(eventId);
    const filter: Record<string, any> = { eventId };
    if (rating !== undefined) {
      filter.rating = rating;
    }
    return this.getReviewsWithStats(filter, limit, offset);
  }

  async getUserReviews(
    userId: string,
    limit?: number,
    offset?: number,
    search?: string,
  ) {
    await this.metadataService.validateUserExistence(userId);

    if (search) {
      return this.getFilteredUserReviewsWithStats(
        userId,
        search,
        limit,
        offset,
      );
    }
    return this.getReviewsWithStats({ userId }, limit, offset);
  }

  async getOrganizationReviews(
    organizationId: string,
    role: 'creator' | 'collaborator' | 'all' = 'all',
    limit?: number,
    offset?: number,
    rating?: number,
  ): Promise<PaginatedResponseDto<Review>> {
    await this.metadataService.validateUserExistence(organizationId);
    const baseFilter =
      role === 'creator'
        ? { creatorId: organizationId }
        : role === 'collaborator'
          ? { collaboratorIds: organizationId }
          : {
              $or: [
                { creatorId: organizationId },
                { collaboratorIds: organizationId },
              ],
            };

    const filter =
      rating !== undefined ? { ...baseFilter, rating } : baseFilter;

    return this.getReviewsWithStats(filter, limit, offset);
  }

  async getOrganizationReviewsStatistics(
    organizationId: string,
    role: 'creator' | 'collaborator' | 'all' = 'all',
    rating?: number,
  ): Promise<ReviewStatsDto> {
    await this.metadataService.validateUserExistence(organizationId);
    const baseFilter =
      role === 'creator'
        ? { creatorId: organizationId }
        : role === 'collaborator'
          ? { collaboratorIds: organizationId }
          : {
              $or: [
                { creatorId: organizationId },
                { collaboratorIds: organizationId },
              ],
            };

    const filter =
      rating !== undefined ? { ...baseFilter, rating } : baseFilter;

    return this.calculateRatingStats(filter);
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

  private async getFilteredUserReviewsWithStats(
    userId: string,
    search: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponseDto<Review> & ReviewStatsDto> {
    const allReviews = await this.reviewModel.find({ userId }).lean();

    if (allReviews.length === 0) {
      return {
        ...new PaginatedResponseDto([], 0, limit || 0, offset || 0),
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        totalReviews: 0,
      };
    }

    const eventIds = [...new Set(allReviews.map((r) => r.eventId))];
    const eventsInfo = await Promise.all(
      eventIds.map((id) => this.metadataService.getEventInfo(id)),
    );

    const eventInfoMap = new Map();
    eventIds.forEach((id, index) => {
      eventInfoMap.set(id, eventsInfo[index]);
    });

    const organizationIds = [
      ...new Set([
        ...allReviews.map((r) => r.creatorId),
        ...allReviews.flatMap((r) => r.collaboratorIds || []),
      ]),
    ];

    const organizationsInfo = await Promise.all(
      organizationIds.map((id) => this.metadataService.getUserInfo(id)),
    );

    const orgInfoMap = new Map();
    organizationIds.forEach((id, index) => {
      orgInfoMap.set(id, organizationsInfo[index]);
    });

    const searchLower = search.toLowerCase();
    const filteredReviews = allReviews.filter((review) => {
      const eventInfo = eventInfoMap.get(review.eventId);
      const creatorInfo = orgInfoMap.get(review.creatorId);

      if (eventInfo?.name?.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (creatorInfo?.name?.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (creatorInfo?.username?.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (review.collaboratorIds) {
        for (const collabId of review.collaboratorIds) {
          const collabInfo = orgInfoMap.get(collabId);
          if (
            collabInfo?.name?.toLowerCase().includes(searchLower) ||
            collabInfo?.username?.toLowerCase().includes(searchLower)
          ) {
            return true;
          }
        }
      }

      return false;
    });

    const total = filteredReviews.length;
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : total;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    const reviewDocuments = paginatedReviews.map(
      (r) => new this.reviewModel(r),
    );

    const stats = this.calculateRatingStatsFromReviews(filteredReviews);

    return {
      ...new PaginatedResponseDto(
        reviewDocuments,
        total,
        limit || total,
        offset || 0,
      ),
      ...stats,
    };
  }

  private calculateRatingStatsFromReviews(reviews: any[]): ReviewStatsDto {
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let sumRating = 0;
    reviews.forEach((review) => {
      ratingDistribution[review.rating] =
        (ratingDistribution[review.rating] || 0) + 1;
      sumRating += review.rating;
    });

    const averageRating = reviews.length > 0 ? sumRating / reviews.length : 0;

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      totalReviews: reviews.length,
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
    const totalReviews =
      result[0]?.distribution?.reduce(
        (sum: number, item: { count: number }) => sum + item.count,
        0,
      ) || 0;

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      totalReviews,
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

  async getUserReviewedEventIds(
    userId: string,
    eventIds: string[],
  ): Promise<string[]> {
    if (eventIds.length === 0) return [];

    const reviews = await this.reviewModel
      .find({
        userId,
        eventId: { $in: eventIds },
      })
      .select({ eventId: 1, _id: 0 })
      .lean();

    return reviews.map((r) => r.eventId);
  }

  async getReview(userId: string, eventId: string): Promise<Review> {
    await this.metadataService.validateUserExistence(userId);
    await this.metadataService.validateEventExistence(eventId);
    const review = await this.reviewModel.findOne({ userId, eventId });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }
}
