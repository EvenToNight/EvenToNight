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
    const matchStage: any = { userId };

    if (conversationIds) {
      matchStage.conversationId = { $in: conversationIds };
    }

    return this.participantModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conversationId',
        },
      },
      { $unwind: '$conversationId' },
      { $sort: { 'conversationId.updatedAt': -1 } },
      { $skip: offset },
      { $limit: limit + 1 },
    ]);
  }

  async buildSearchResults(
    participants: any[],
    userId: string,
  ): Promise<(ConversationListItemDTO | null)[]> {
    if (participants.length === 0) return [];

    const conversationIds = participants
      .map((p) => p.conversationId?._id)
      .filter(Boolean);

    if (conversationIds.length === 0) return [];

    const lastMessages = await this.findLastMessages(conversationIds);
    const lastMessageMap = new Map(
      lastMessages.map((msg) => [msg.conversationId.toString(), msg]),
    );

    const partnerParticipants = await this.findPartnerParticipants(
      conversationIds,
      userId,
    );
    const partnerMap = new Map(
      partnerParticipants.map((p) => [p.conversationId.toString(), p]),
    );

    return Promise.all(
      participants.map(async (participant) => {
        const conversation = participant.conversationId;
        if (!conversation) return null;

        const conversationIdStr = conversation._id.toString();
        const lastMessage = lastMessageMap.get(conversationIdStr);
        const partnerParticipant = partnerMap.get(conversationIdStr);

        if (!partnerParticipant) return null;

        return await this.dataMapperService.buildSearchResultItem(
          conversation,
          participant,
          partnerParticipant,
          lastMessage,
          userId,
        );
      }),
    );
  }

  private async findLastMessages(
    conversationIds: Types.ObjectId[],
  ): Promise<any[]> {
    return this.messageModel
      .aggregate([
        {
          $match: { conversationId: { $in: conversationIds } },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: '$conversationId',
            content: { $first: '$content' },
            senderId: { $first: '$senderId' },
            createdAt: { $first: '$createdAt' },
            conversationId: { $first: '$conversationId' },
          },
        },
        {
          $project: {
            _id: 0,
            content: 1,
            senderId: 1,
            createdAt: 1,
            conversationId: 1,
          },
        },
      ])
      .exec();
  }

  private async findPartnerParticipants(
    conversationIds: Types.ObjectId[],
    userId: string,
  ): Promise<any[]> {
    return this.participantModel
      .find({
        conversationId: { $in: conversationIds },
        userId: { $ne: userId },
      })
      .select('userId userName role conversationId')
      .exec();
  }
}
