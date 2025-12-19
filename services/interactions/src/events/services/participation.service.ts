import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participation } from '../schemas/participation.schema';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { MetadataService } from '../../metadata/services/metadata.service';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectModel(Participation.name)
    private participationModel: Model<Participation>,
    private readonly metadataService: MetadataService,
  ) {}

  async participate(eventId: string, userId: string): Promise<Participation> {
    await this.metadataService.validateUser(userId);
    await this.metadataService.checkEventCompleted(eventId);
    const existing = await this.participationModel.findOne({ eventId, userId });
    if (existing) {
      throw new ConflictException('Already purchased ticket for this event');
    }
    const participation = new this.participationModel({ eventId, userId });
    return participation.save();
  }

  async getEventParticipants(
    eventId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<PaginatedResponseDto<Participation>> {
    const [items, total] = await Promise.all([
      this.participationModel
        .find({ eventId })
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.participationModel.countDocuments({ eventId }),
    ]);

    return new PaginatedResponseDto(items, total, limit, offset);
  }

  async getUserParticipations(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<PaginatedResponseDto<Participation>> {
    const [items, total] = await Promise.all([
      this.participationModel
        .find({ userId })
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.participationModel.countDocuments({ userId }),
    ]);

    return new PaginatedResponseDto(items, total, limit, offset);
  }

  async hasTicket(eventId: string, userId: string): Promise<boolean> {
    const participation = await this.participationModel.findOne({
      eventId,
      userId,
    });
    return !!participation;
  }
}
