import 'reflect-metadata';
import { Types } from 'mongoose';
import { MessageManagerService } from '../../src/conversations/services/message-manager.service';

describe('MessageManagerService', () => {
  let messageModel: jest.Mock & {
    find: jest.Mock;
  };
  let conversationModel: {
    updateOne: jest.Mock;
  };
  let participantModel: {
    updateOne: jest.Mock;
    findOne: jest.Mock;
  };
  let rabbitMqPublisher: {
    publishMessageCreated: jest.Mock;
  };
  let usersService: {
    getUserInfo: jest.Mock;
  };
  let service: MessageManagerService;

  beforeEach(() => {
    messageModel = jest.fn() as jest.Mock & {
      find: jest.Mock;
    };
    messageModel.find = jest.fn();

    conversationModel = {
      updateOne: jest.fn(),
    };

    participantModel = {
      updateOne: jest.fn(),
      findOne: jest.fn(),
    };

    rabbitMqPublisher = {
      publishMessageCreated: jest.fn(),
    };

    usersService = {
      getUserInfo: jest.fn(),
    };

    service = new MessageManagerService(
      messageModel as never,
      conversationModel as never,
      participantModel as never,
      rabbitMqPublisher as never,
      usersService as never,
    );
  });

  it('createMessage saves message and publishes event when recipient exists', async () => {
    const messageId = new Types.ObjectId();
    const createdAt = new Date('2026-03-19T18:00:00.000Z');
    const savedMessage = {
      _id: messageId,
      createdAt,
      content: 'Hello',
      senderId: 'sender-1',
    };

    messageModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savedMessage),
    }));

    const updateConversationSession = jest.fn().mockResolvedValue({});
    conversationModel.updateOne.mockReturnValue({
      session: updateConversationSession,
    });

    const updateParticipantSession = jest.fn().mockResolvedValue({});
    participantModel.updateOne.mockReturnValue({
      session: updateParticipantSession,
    });

    const findParticipantSession = jest
      .fn()
      .mockResolvedValue({ userId: 'receiver-1' });
    participantModel.findOne.mockReturnValue({
      session: findParticipantSession,
    });

    usersService.getUserInfo.mockResolvedValue({
      name: 'Sender Name',
      avatar: 'avatar.jpg',
    });

    const result = await service.createMessage(
      new Types.ObjectId().toString(),
      'sender-1',
      'Hello',
    );

    expect(result).toEqual(savedMessage);
    expect(rabbitMqPublisher.publishMessageCreated).toHaveBeenCalledTimes(1);
    expect(rabbitMqPublisher.publishMessageCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        receiverId: 'receiver-1',
        senderId: 'sender-1',
        senderName: 'Sender Name',
        senderAvatar: 'avatar.jpg',
        message: 'Hello',
      }),
    );
  });

  it('createMessage does not publish when recipient is not found', async () => {
    messageModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        createdAt: new Date(),
      }),
    }));

    conversationModel.updateOne.mockReturnValue({
      session: jest.fn().mockResolvedValue({}),
    });
    participantModel.updateOne.mockReturnValue({
      session: jest.fn().mockResolvedValue({}),
    });
    participantModel.findOne.mockReturnValue({
      session: jest.fn().mockResolvedValue(null),
    });

    await service.createMessage(
      new Types.ObjectId().toString(),
      'sender-1',
      'Hi',
    );

    expect(rabbitMqPublisher.publishMessageCreated).not.toHaveBeenCalled();
  });

  it('fetchMessages uses sort, skip, and limit with pagination', async () => {
    const exec = jest.fn().mockResolvedValue([{ id: 1 }]);
    const limit = jest.fn().mockReturnValue({ exec });
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });
    messageModel.find.mockReturnValue({ sort });

    const conversationId = new Types.ObjectId().toString();
    const result = await service.fetchMessages(conversationId, 10, 5);

    expect(messageModel.find).toHaveBeenCalledWith({
      conversationId: new Types.ObjectId(conversationId),
    });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(skip).toHaveBeenCalledWith(5);
    expect(limit).toHaveBeenCalledWith(11);
    expect(result).toEqual([{ id: 1 }]);
  });
});
