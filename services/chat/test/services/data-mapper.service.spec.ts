import 'reflect-metadata';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { DataMapperService } from '../../src/conversations/services/data-mapper.service';
import { ParticipantRole } from '../../src/conversations/schemas/participant.schema';
import { Message } from '../../src/conversations/schemas/message.schema';
import { UserRole } from '../../src/users/schemas/user.schema';
import { UsersService } from '../../src/users/services/users.service';

describe('DataMapperService', () => {
  const defaultAvatar = 'https://media.eventonight.site/users/default.jpg';

  let usersService: {
    getUserInfo: jest.Mock;
  };
  let messageModel: {
    aggregate: jest.Mock;
    findOne: jest.Mock;
  };
  let service: DataMapperService;

  beforeEach(() => {
    usersService = {
      getUserInfo: jest.fn(),
    };

    messageModel = {
      aggregate: jest.fn(),
      findOne: jest.fn(),
    };

    service = new DataMapperService(
      usersService as unknown as UsersService,
      messageModel as unknown as Model<Message>,
    );
  });

  it('buildConversationListItems maps users and last messages with fallbacks', async () => {
    const conv1 = new Types.ObjectId();
    const conv2 = new Types.ObjectId();

    const participants = [
      {
        conversationId: {
          _id: conv1,
          organizationId: 'org-1',
          userId: 'member-1',
        },
        unreadCount: 3,
      },
      {
        conversationId: {
          _id: conv2,
          organizationId: 'org-2',
          userId: 'member-2',
        },
        unreadCount: 0,
      },
    ];

    const now = new Date('2026-03-19T10:00:00.000Z');
    messageModel.aggregate.mockResolvedValue([
      {
        _id: conv1,
        content: 'Ciao',
        senderId: 'member-1',
        createdAt: now,
      },
    ]);

    usersService.getUserInfo.mockImplementation((id: string) => {
      const data: Record<
        string,
        { id: string; name: string; avatar: string } | null
      > = {
        'org-1': { id: 'org-1', name: 'Org One', avatar: 'org1.jpg' },
        'member-1': { id: 'member-1', name: 'Member One', avatar: 'm1.jpg' },
        'org-2': null,
        'member-2': { id: 'member-2', name: '', avatar: '' },
      };

      return data[id] ?? null;
    });

    const result = await service.buildConversationListItems(participants);

    expect(messageModel.aggregate).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      id: conv1.toString(),
      organization: { id: 'org-1', name: 'Org One', avatar: 'org1.jpg' },
      member: { id: 'member-1', name: 'Member One', avatar: 'm1.jpg' },
      lastMessage: {
        content: 'Ciao',
        senderId: 'member-1',
        timestamp: now,
      },
      unreadCount: 3,
    });

    expect(result[1]).toEqual({
      id: conv2.toString(),
      organization: {
        id: 'org-2',
        name: 'Unknown User',
        avatar: defaultAvatar,
      },
      member: { id: 'member-2', name: 'Unknown', avatar: defaultAvatar },
      lastMessage: {
        content: '',
        senderId: '',
        timestamp: new Date(0),
      },
      unreadCount: 0,
    });
  });

  it('buildConversationListItem returns null lastMessage when no message exists', async () => {
    usersService.getUserInfo
      .mockResolvedValueOnce({ id: 'org-1', name: 'Org', avatar: 'o.jpg' })
      .mockResolvedValueOnce({
        id: 'member-1',
        name: 'Member',
        avatar: 'm.jpg',
      });

    const exec = jest.fn().mockResolvedValue(null);
    const select = jest.fn().mockReturnValue({ exec });
    const sort = jest.fn().mockReturnValue({ select });
    messageModel.findOne.mockReturnValue({ sort });

    const conversationId = new Types.ObjectId();
    const result = await service.buildConversationListItem(
      {
        _id: conversationId,
        organizationId: 'org-1',
        userId: 'member-1',
      },
      { unreadCount: 7 },
    );

    expect(result.lastMessage).toBeNull();
    expect(result.unreadCount).toBe(7);
  });

  it('buildMessageDTOs maps sender info and computes isRead', async () => {
    usersService.getUserInfo.mockImplementation((id: string) => {
      if (id === 'u1') {
        return { id: 'u1', name: 'Alice', avatar: 'alice.jpg' };
      }

      return null;
    });

    const older = new Date('2026-03-18T10:00:00.000Z');
    const newer = new Date('2026-03-20T10:00:00.000Z');

    const messages = [
      {
        _id: new Types.ObjectId(),
        senderId: 'u1',
        content: 'one',
        createdAt: older,
      },
      {
        _id: new Types.ObjectId(),
        senderId: 'u2',
        content: 'two',
        createdAt: newer,
      },
    ];

    const result = await service.buildMessageDTOs(messages, 'conv-1', {
      lastReadAt: new Date('2026-03-19T00:00:00.000Z'),
    });

    expect(result[0].sender).toEqual({
      id: 'u1',
      name: 'Alice',
      avatar: 'alice.jpg',
    });
    expect(result[0].isRead).toBe(true);

    expect(result[1].sender).toEqual({
      id: 'u2',
      name: 'Unknown User',
      avatar: defaultAvatar,
    });
    expect(result[1].isRead).toBe(false);
  });

  it('buildSearchResultItem maps organization and member based on partner role', async () => {
    usersService.getUserInfo
      .mockResolvedValueOnce({ id: 'me', name: 'Me', avatar: 'me.jpg' })
      .mockResolvedValueOnce({ id: 'partner', name: 'Partner', avatar: '' });

    const timestamp = new Date('2026-03-19T18:00:00.000Z');
    const result = await service.buildSearchResultItem(
      { _id: new Types.ObjectId() },
      { userName: 'My Name', unreadCount: 2 },
      {
        userId: 'partner',
        userName: 'Partner Name',
        role: ParticipantRole.ORGANIZATION,
      },
      {
        content: 'Ultimo messaggio',
        senderId: new Types.ObjectId(),
        createdAt: timestamp,
      },
      'me',
    );

    expect(result.organization).toEqual({
      id: 'partner',
      name: 'Partner Name',
      avatar: defaultAvatar,
    });
    expect(result.member).toEqual({
      id: 'me',
      name: 'My Name',
      avatar: 'me.jpg',
    });
    expect(result.lastMessage?.timestamp).toEqual(timestamp);
  });

  it('buildSuggestions switches organization/member according to user role', async () => {
    usersService.getUserInfo.mockResolvedValue({
      id: 'me',
      name: 'Current User',
      avatar: 'me.jpg',
      role: UserRole.MEMBER,
    });

    const suggestions = await service.buildSuggestions(
      [
        {
          id: 'org-99',
          name: 'Org 99',
          avatar: 'o99.jpg',
          role: UserRole.ORGANIZATION,
        },
        {
          id: 'member-22',
          name: 'Member 22',
          avatar: '',
          role: UserRole.MEMBER,
        },
      ],
      'me',
    );

    expect(suggestions[0].organization.id).toBe('org-99');
    expect(suggestions[0].member.id).toBe('me');

    expect(suggestions[1].organization.id).toBe('me');
    expect(suggestions[1].member.id).toBe('member-22');
  });
});
