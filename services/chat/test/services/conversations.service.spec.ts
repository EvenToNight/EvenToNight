import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ConversationsService } from '../../src/conversations/services/conversations.service';

describe('ConversationsService', () => {
  let conversationModel: { findOne: jest.Mock };
  let participantModel: {
    find: jest.Mock;
    findOne: jest.Mock;
    updateOne: jest.Mock;
  };
  let messageModel: object;
  let databaseTransaction: { executeInTransaction: jest.Mock };
  let dataMapperService: {
    buildConversationListItems: jest.Mock;
    buildConversationListItem: jest.Mock;
    buildMessageDTOs: jest.Mock;
    buildConversationDetail: jest.Mock;
  };
  let messageManagerService: {
    createMessage: jest.Mock;
    fetchMessages: jest.Mock;
  };
  let userSuggestionService: {
    getSuggestedUsers: jest.Mock;
    addSuggestionsIfNeeded: jest.Mock;
  };
  let conversationSearchService: {
    findFilteredConversationIds: jest.Mock;
    fetchFilteredParticipants: jest.Mock;
    buildSearchResults: jest.Mock;
  };
  let conversationManagerService: {
    ensureConversationDoesNotExist: jest.Mock;
    findOrCreateConversation: jest.Mock;
    validateConversationExists: jest.Mock;
    validateUserIsParticipant: jest.Mock;
    validateUserExists: jest.Mock;
    fetchUserParticipants: jest.Mock;
    validateObjectId: jest.Mock;
    findConversationOrThrow: jest.Mock;
    findParticipant: jest.Mock;
  };
  let service: ConversationsService;

  beforeEach(() => {
    conversationModel = { findOne: jest.fn() };
    participantModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };
    messageModel = {};

    databaseTransaction = {
      executeInTransaction: jest.fn((callback: (session: unknown) => unknown) =>
        callback('session-1'),
      ),
    };

    dataMapperService = {
      buildConversationListItems: jest.fn(),
      buildConversationListItem: jest.fn(),
      buildMessageDTOs: jest.fn(),
      buildConversationDetail: jest.fn(),
    };

    messageManagerService = {
      createMessage: jest.fn(),
      fetchMessages: jest.fn(),
    };

    userSuggestionService = {
      getSuggestedUsers: jest.fn(),
      addSuggestionsIfNeeded: jest.fn(),
    };

    conversationSearchService = {
      findFilteredConversationIds: jest.fn(),
      fetchFilteredParticipants: jest.fn(),
      buildSearchResults: jest.fn(),
    };

    conversationManagerService = {
      ensureConversationDoesNotExist: jest.fn(),
      findOrCreateConversation: jest.fn(),
      validateConversationExists: jest.fn(),
      validateUserIsParticipant: jest.fn(),
      validateUserExists: jest.fn(),
      fetchUserParticipants: jest.fn(),
      validateObjectId: jest.fn(),
      findConversationOrThrow: jest.fn(),
      findParticipant: jest.fn(),
    };

    service = new ConversationsService(
      conversationModel as never,
      participantModel as never,
      messageModel as never,
      databaseTransaction as never,
      dataMapperService as never,
      messageManagerService as never,
      userSuggestionService as never,
      conversationSearchService as never,
      conversationManagerService as never,
    );
  });

  it('createConversationWithMessage orchestrates transaction flow', async () => {
    const conversationId = new Types.ObjectId();
    conversationManagerService.findOrCreateConversation.mockResolvedValue({
      _id: conversationId,
    });
    messageManagerService.createMessage.mockResolvedValue({
      _id: new Types.ObjectId(),
    });

    await service.createConversationWithMessage('sender-1', {
      recipientId: 'recipient-1',
      content: 'Hi',
    });

    expect(
      conversationManagerService.ensureConversationDoesNotExist,
    ).toHaveBeenCalledWith('recipient-1', 'sender-1', 'session-1');
    expect(messageManagerService.createMessage).toHaveBeenCalledWith(
      conversationId.toString(),
      'sender-1',
      'Hi',
      'session-1',
    );
  });

  it('sendMessageToConversation validates and sends in transaction', async () => {
    messageManagerService.createMessage.mockResolvedValue({
      _id: new Types.ObjectId(),
    });

    await service.sendMessageToConversation('sender-1', 'conv-1', {
      content: 'Ping',
    });

    expect(
      conversationManagerService.validateConversationExists,
    ).toHaveBeenCalledWith('conv-1', 'session-1');
    expect(
      conversationManagerService.validateUserIsParticipant,
    ).toHaveBeenCalledWith('conv-1', 'sender-1', 'session-1');
  });

  it('getUserConversations returns paginated mapped conversations', async () => {
    conversationManagerService.fetchUserParticipants.mockResolvedValue([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);
    dataMapperService.buildConversationListItems.mockResolvedValue([
      { id: 'c1' },
      { id: 'c2' },
    ]);

    const result = await service.getUserConversations('u1', {
      limit: 2,
      offset: 0,
    });

    expect(result).toEqual({
      items: [{ id: 'c1' }, { id: 'c2' }],
      limit: 2,
      offset: 0,
      hasMore: true,
    });
  });

  it('getTotalUnreadCount sums participant unreadCount', async () => {
    participantModel.find.mockResolvedValue([
      { unreadCount: 2 },
      { unreadCount: 3 },
    ]);

    const total = await service.getTotalUnreadCount('u1');

    expect(total).toBe(5);
  });

  it('getConversationById validates and maps conversation', async () => {
    const conversation = { _id: new Types.ObjectId() };
    conversationManagerService.findConversationOrThrow.mockResolvedValue(
      conversation,
    );
    participantModel.findOne.mockResolvedValue({ unreadCount: 1 });
    dataMapperService.buildConversationListItem.mockResolvedValue({
      id: 'mapped',
    });

    const result = await service.getConversationById('conv-1', 'u1');

    expect(conversationManagerService.validateObjectId).toHaveBeenCalledWith(
      'conv-1',
    );
    expect(dataMapperService.buildConversationListItem).toHaveBeenCalledWith(
      conversation,
      { unreadCount: 1 },
    );
    expect(result).toEqual({ id: 'mapped' });
  });

  it('getMessages maps messages and returns hasMore', async () => {
    const markSpy = jest.spyOn(service, 'markAsReadAsync').mockResolvedValue();
    conversationManagerService.findParticipant.mockResolvedValue({
      lastReadAt: new Date(),
    });
    messageManagerService.fetchMessages.mockResolvedValue([
      { id: 'm1' },
      { id: 'm2' },
      { id: 'm3' },
    ]);
    dataMapperService.buildMessageDTOs.mockResolvedValue([
      { id: 'dto1' },
      { id: 'dto2' },
    ]);

    const result = await service.getMessages('conv-1', 'u1', {
      limit: 2,
      offset: 0,
    });

    expect(result).toEqual({
      items: [{ id: 'dto1' }, { id: 'dto2' }],
      limit: 2,
      offset: 0,
      hasMore: true,
    });
    expect(markSpy).toHaveBeenCalledWith('conv-1', 'u1');
  });

  it('getConversationByUsers throws NotFoundException when conversation is absent', async () => {
    conversationModel.findOne.mockResolvedValue(null);

    await expect(service.getConversationByUsers('org', 'user')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('getConversationWithMessagesByUsers delegates to getMessages', async () => {
    const conversation = { _id: new Types.ObjectId() };
    conversationModel.findOne.mockResolvedValue(conversation);
    const getMessagesSpy = jest
      .spyOn(service, 'getMessages')
      .mockResolvedValue({ items: [], limit: 50, offset: 0, hasMore: false });

    await service.getConversationWithMessagesByUsers('org', 'user', {
      limit: 50,
      offset: 0,
    });

    expect(getMessagesSpy).toHaveBeenCalledWith(conversation._id, 'user', {
      limit: 50,
      offset: 0,
    });
  });

  it('searchConversationWithFilters returns suggestions when no filtered ids are found', async () => {
    conversationSearchService.findFilteredConversationIds.mockResolvedValue([]);
    userSuggestionService.getSuggestedUsers.mockResolvedValue({
      items: [{ id: null }],
      limit: 5,
      offset: 0,
      hasMore: false,
    });

    const result = await service.searchConversationWithFilters('u1', {
      limit: 5,
      offset: 0,
      name: 'abc',
    });

    expect(userSuggestionService.getSuggestedUsers).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
  });

  it('searchConversationWithFilters returns valid conversations and appends suggestions on first page', async () => {
    const conversationId = new Types.ObjectId();
    conversationSearchService.findFilteredConversationIds.mockResolvedValue([
      conversationId,
    ]);
    conversationSearchService.fetchFilteredParticipants.mockResolvedValue([
      { id: 'p1' },
    ]);
    conversationSearchService.buildSearchResults.mockResolvedValue([
      { id: 'c1' },
      null,
    ]);

    const result = await service.searchConversationWithFilters('u1', {
      limit: 2,
      offset: 0,
      recipientId: 'r1',
    });

    expect(userSuggestionService.addSuggestionsIfNeeded).toHaveBeenCalledTimes(
      1,
    );
    expect(result.items).toEqual([{ id: 'c1' }]);
  });

  it('markAsRead resets unread count and lastReadAt', async () => {
    participantModel.updateOne.mockResolvedValue({});

    await service.markAsRead(new Types.ObjectId().toString(), 'u1');

    expect(participantModel.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1' }),
      expect.objectContaining({ unreadCount: 0 }),
    );
  });

  it('markAsReadAsync catches and logs errors', async () => {
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    jest.spyOn(service, 'markAsRead').mockRejectedValue(new Error('db failed'));

    await service.markAsReadAsync('conv-1', 'u1');

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
