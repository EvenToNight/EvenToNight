import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ConversationManagerService } from '../../src/conversations/services/conversation.manager.service';
import { UserRole } from '../../src/users/schemas/user.schema';

describe('ConversationManagerService', () => {
  let participantModel: {
    aggregate: jest.Mock;
    findOne: jest.Mock;
  };
  let conversationModel: {
    findOne: jest.Mock;
    findById: jest.Mock;
  };
  let usersService: {
    userExists: jest.Mock;
    getUsername: jest.Mock;
  };
  let dataMapperService: {
    fetchUsersInfo: jest.Mock;
  };
  let service: ConversationManagerService;

  beforeEach(() => {
    participantModel = {
      aggregate: jest.fn(),
      findOne: jest.fn(),
    };

    conversationModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    usersService = {
      userExists: jest.fn(),
      getUsername: jest.fn(),
    };

    dataMapperService = {
      fetchUsersInfo: jest.fn(),
    };

    service = new ConversationManagerService(
      participantModel as never,
      conversationModel as never,
      usersService as never,
      dataMapperService as never,
    );
  });

  it('findOrCreateConversation returns existing conversation', async () => {
    dataMapperService.fetchUsersInfo.mockResolvedValue([
      { role: UserRole.ORGANIZATION },
      { role: UserRole.MEMBER },
    ]);

    const existingConversation = { _id: new Types.ObjectId() };
    const session = jest.fn().mockResolvedValue(existingConversation);
    conversationModel.findOne.mockReturnValue({ session });

    const result = await service.findOrCreateConversation('org-1', 'user-1');

    expect(result).toEqual(existingConversation);
    expect(conversationModel.findOne).toHaveBeenCalledWith({
      organizationId: 'org-1',
      userId: 'user-1',
    });
  });

  it('validateConversationExists throws for invalid object id', async () => {
    await expect(
      service.validateConversationExists('not-an-object-id'),
    ).rejects.toThrow(BadRequestException);
  });

  it('validateConversationExists throws NotFoundException for missing conversation', async () => {
    const session = jest.fn().mockResolvedValue(null);
    conversationModel.findById.mockReturnValue({ session });

    await expect(
      service.validateConversationExists(new Types.ObjectId().toString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('validateUserIsParticipant throws when user is not participant', async () => {
    usersService.userExists.mockResolvedValue(true);
    const session = jest.fn().mockResolvedValue(null);
    participantModel.findOne.mockReturnValue({ session });

    await expect(
      service.validateUserIsParticipant(new Types.ObjectId().toString(), 'u1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('verifyUserInConversation returns true when participant exists', async () => {
    usersService.userExists.mockResolvedValue(true);
    const session = jest.fn().mockResolvedValue({ userId: 'u1' });
    participantModel.findOne.mockReturnValue({ session });

    const result = await service.verifyUserInConversation(
      new Types.ObjectId().toString(),
      'u1',
    );

    expect(result).toBe(true);
  });

  it('validateUserExists throws when user is missing', async () => {
    usersService.userExists.mockResolvedValue(false);

    await expect(service.validateUserExists('missing')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('fetchUserParticipants builds aggregate pipeline with pagination', async () => {
    participantModel.aggregate.mockResolvedValue([{ id: 1 }]);

    const result = await service.fetchUserParticipants('u1', 5, 2);

    expect(participantModel.aggregate).toHaveBeenCalledWith([
      { $match: { userId: 'u1' } },
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
      { $skip: 2 },
      { $limit: 6 },
    ]);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('ensureConversationDoesNotExist throws when existing conversation found', async () => {
    const session = jest.fn().mockResolvedValue({ _id: 1 });
    conversationModel.findOne.mockReturnValue({ session });

    await expect(
      service.ensureConversationDoesNotExist('org-1', 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('findConversationOrThrow throws when conversation does not exist', async () => {
    conversationModel.findById.mockResolvedValue(null);

    await expect(service.findConversationOrThrow('id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findParticipant queries by conversation and user id', async () => {
    participantModel.findOne.mockResolvedValue({ userId: 'u1' });
    const conversationId = new Types.ObjectId().toString();

    await service.findParticipant(conversationId, 'u1');

    expect(participantModel.findOne).toHaveBeenCalledWith({
      conversationId: new Types.ObjectId(conversationId),
      userId: 'u1',
    });
  });
});
