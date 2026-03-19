import 'reflect-metadata';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { DataMapperService } from '../../src/conversations/services/data-mapper.service';
import { ConversationSearchService } from '../../src/conversations/services/conversation.search.service';
import { Message } from '../../src/conversations/schemas/message.schema';

describe('ConversationSearchService', () => {
  let messageModel: {
    aggregate: jest.Mock;
  };
  let participantModel: {
    find: jest.Mock;
    aggregate: jest.Mock;
  };
  let dataMapperService: {
    buildSearchResultItem: jest.Mock;
  };
  let service: ConversationSearchService;

  beforeEach(() => {
    messageModel = {
      aggregate: jest.fn(),
    };
    participantModel = {
      find: jest.fn(),
      aggregate: jest.fn(),
    };
    dataMapperService = {
      buildSearchResultItem: jest.fn(),
    };

    service = new ConversationSearchService(
      messageModel as unknown as Model<Message>,
      participantModel as unknown as Model<any>,
      dataMapperService as unknown as DataMapperService,
    );
  });

  it('findFilteredConversationIds applies text filters and returns mapped ids', async () => {
    const exec = jest
      .fn()
      .mockResolvedValue([
        { conversationId: new Types.ObjectId() },
        { conversationId: new Types.ObjectId() },
      ]);
    const select = jest.fn().mockReturnValue({ exec });
    participantModel.find.mockReturnValue({ select });

    const result = await service.findFilteredConversationIds(
      'me',
      'anna',
      'usr',
    );

    expect(participantModel.find).toHaveBeenCalledWith({
      userId: { $ne: 'me', $regex: '^usr', $options: 'i' },
      userName: { $regex: 'anna', $options: 'i' },
    });
    expect(result).toHaveLength(2);
  });

  it('fetchFilteredParticipants builds aggregate pipeline with conversation filter', async () => {
    const conversationIds = [new Types.ObjectId()];
    participantModel.aggregate.mockResolvedValue([{ any: true }]);

    const result = await service.fetchFilteredParticipants(
      'me',
      conversationIds,
      10,
      5,
    );

    expect(participantModel.aggregate).toHaveBeenCalledWith([
      { $match: { userId: 'me', conversationId: { $in: conversationIds } } },
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
      { $skip: 5 },
      { $limit: 11 },
    ]);
    expect(result).toEqual([{ any: true }]);
  });

  it('buildSearchResults returns empty array when participants is empty', async () => {
    const result = await service.buildSearchResults([], 'me');

    expect(result).toEqual([]);
    expect(messageModel.aggregate).not.toHaveBeenCalled();
  });

  it('buildSearchResults returns empty array when no conversation ids are available', async () => {
    const result = await service.buildSearchResults(
      [{ conversationId: null }],
      'me',
    );

    expect(result).toEqual([]);
  });

  it('buildSearchResults maps valid participants and returns null for invalid ones', async () => {
    const c1 = new Types.ObjectId();
    const c2 = new Types.ObjectId();

    const participants = [
      {
        conversationId: { _id: c1 },
        unreadCount: 1,
      },
      {
        conversationId: { _id: c2 },
        unreadCount: 2,
      },
      {
        conversationId: null,
        unreadCount: 3,
      },
    ];

    const messagesExec = jest.fn().mockResolvedValue([
      {
        conversationId: c1,
        content: 'hello',
        senderId: 'sender-1',
        createdAt: new Date('2026-03-19T12:00:00.000Z'),
      },
    ]);
    messageModel.aggregate.mockReturnValue({ exec: messagesExec });

    const partnersExec = jest.fn().mockResolvedValue([
      {
        conversationId: c1,
        userId: 'partner-1',
        userName: 'Partner',
        role: 'organization',
      },
    ]);
    const partnersSelect = jest.fn().mockReturnValue({ exec: partnersExec });
    participantModel.find.mockReturnValue({ select: partnersSelect });

    dataMapperService.buildSearchResultItem.mockResolvedValue({
      id: 'mapped-1',
    });

    const result = await service.buildSearchResults(participants, 'me');

    expect(messageModel.aggregate).toHaveBeenCalledTimes(1);
    expect(dataMapperService.buildSearchResultItem).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 'mapped-1' }, null, null]);
  });
});
