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
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

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

  async getEventReviews(
    eventId: string,
    limit: number | undefined,
    offset: number | undefined,
  ): Promise<PaginatedResponseDto<Review>> {
    const query = this.reviewModel.find({ eventId });
    if (offset !== undefined) {
      query.skip(offset);
    }
    if (limit !== undefined) {
      query.limit(limit);
    }
    query.sort({ createdAt: -1 });

    const [items, total] = await Promise.all([
      query.exec(),
      this.reviewModel.countDocuments({ eventId }),
    ]);

    return new PaginatedResponseDto(items, total, limit || total, offset || 0);
  }

  async getUserReviews(
    userId: string,
    limit: number | undefined,
    offset: number | undefined,
  ) {
    const query = this.reviewModel.find({ userId });
    if (offset !== undefined) {
      query.skip(offset);
    }
    if (limit !== undefined) {
      query.limit(limit);
    }
    query.sort({ createdAt: -1 });

    const [items, total] = await Promise.all([
      query.exec(),
      this.reviewModel.countDocuments({ userId }),
    ]);
    return new PaginatedResponseDto(items, total, limit || total, offset || 0);
  }

  async getOrganizationReviews(
    organizationId: string,
    role: 'owner' | 'collaborator' | 'all' = 'all',
    limit: number = 20,
    offset: number = 0,
  ): Promise<PaginatedResponseDto<Review>> {
    let filter: any;
    if (role === 'owner') {
      filter = { organizationId };
    } else if (role === 'collaborator') {
      filter = { collaboratorsId: organizationId };
    } else {
      filter = {
        $or: [{ organizationId }, { collaboratorsId: organizationId }],
      };
    }

    const [items, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.reviewModel.countDocuments(filter),
    ]);

    return new PaginatedResponseDto(items, total, limit, offset);
  }
}
