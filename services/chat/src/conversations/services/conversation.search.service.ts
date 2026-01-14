import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { ConversationListItemDTO } from '../dto/conversation-list-item.dto';
import { DataMapperService } from './data-mapper.service';

@Injectable()
export class ConversationSearchService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<any>,
    @InjectModel('Participant') private readonly participantModel: Model<any>,
    private readonly dataMapperService: DataMapperService,
  ) {}

  async findFilteredConversationIds(
    userId: string,
    name?: string,
    recipientId?: string,
  ): Promise<Types.ObjectId[]> {
    const partnerQuery: any = { userId: { $ne: userId } };

    if (name) {
      partnerQuery.userName = { $regex: name, $options: 'i' };
    }

    if (recipientId) {
      partnerQuery.userId = {
        ...partnerQuery.userId,
        $regex: `^${recipientId}`,
        $options: 'i',
      };
    }

    const partners = await this.participantModel
      .find(partnerQuery)
      .select('conversationId')
      .exec();

    return partners.map((p) => p.conversationId);
  }

  async fetchFilteredParticipants(
    userId: string,
    conversationIds: Types.ObjectId[] | null,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    const filter: any = { userId };

    if (conversationIds) {
      filter.conversationId = { $in: conversationIds };
    }

    return this.participantModel
      .find(filter)
      .populate('conversationId')
      .sort({ 'conversationId.updatedAt': -1 })
      .skip(offset)
      .limit(limit + 1)
      .exec();
  }

  async buildSearchResults(
    participants: any[],
    userId: string,
  ): Promise<(ConversationListItemDTO | null)[]> {
    return Promise.all(
      participants.map(async (participant) => {
        const conversation = participant.conversationId;
        if (!conversation) return null;

        const lastMessage = await this.findLastMessage(conversation._id);
        const partnerParticipant = await this.findPartnerParticipant(
          conversation._id,
          userId,
        );

        if (!partnerParticipant) return null;

        return this.dataMapperService.buildSearchResultItem(
          conversation,
          participant,
          partnerParticipant,
          lastMessage,
          userId,
        );
      }),
    );
  }

  private async findLastMessage(conversationId: Types.ObjectId): Promise<any> {
    return this.messageModel
      .findOne({ conversationId })
      .sort({ createdAt: -1 })
      .select('content senderId createdAt')
      .exec();
  }

  private async findPartnerParticipant(
    conversationId: Types.ObjectId,
    userId: string,
  ): Promise<any> {
    return this.participantModel
      .findOne({
        conversationId,
        userId: { $ne: userId },
      })
      .select('userId userName role')
      .exec();
  }
}
