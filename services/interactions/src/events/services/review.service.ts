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
}
